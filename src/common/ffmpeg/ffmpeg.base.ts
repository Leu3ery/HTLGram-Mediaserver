import nodePath from 'node:path';
import fs from 'node:fs/promises';
import ffmpegLib from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
import deleteFile from '../../common/utils/utils.deleteFile';

ffmpegLib.setFfmpegPath(ffmpegPath.path);
ffmpegLib.setFfprobePath(ffprobePath.path);

export async function isRealVideo(inputPath: string): Promise<boolean> {
  const meta = await new Promise<ffmpegLib.FfprobeData>((resolve, reject) => {
    ffmpegLib.ffprobe(inputPath, (err, data) => (err ? reject(err) : resolve(data)));
  });

  const v = meta.streams.filter(s => s.codec_type === 'video');

  // Немає відеопотоку => точно не відео
  if (v.length === 0) return false;

  // Є відеотраки, але перевіримо "осмисленість"
  // інколи iOS кладе ширину/висоту 0 або 1 (placeholder), або кадрову частоту 0/0
  for (const s of v) {
    const w = Number(s.width || 0);
    const h = Number(s.height || 0);
    const avg = String(s.avg_frame_rate || '0/0');
    const hasSize = w >= 8 && h >= 8;               // мініпоріг "не placeholder"
    const hasFps  = avg !== '0/0' && avg !== '0';   // є кадри/частота

    if (hasSize && hasFps) return true; // бодай один осмислений відеопотік = справжнє відео
  }

  // якщо всі відеотреки виглядають як placeholder — це аудіо
  return false;
}

// Мінімальний хелпер: повертає { finalPath, finalMime, finalSize }
export async function ensureMp4(
  inputPath: string
): Promise<{ finalPath: string; finalMime: string; finalSize: number }> {
  const meta = await new Promise<ffmpegLib.FfprobeData>((resolve, reject) => {
    ffmpegLib.ffprobe(inputPath, (err, data) => (err ? reject(err) : resolve(data)))
  })

  const format = (meta.format.format_name || '').toLowerCase()
  const v = meta.streams.find(s => s.codec_type === 'video')
  const a = meta.streams.find(s => s.codec_type === 'audio')

  const mp4ish = format.includes('mp4') || format.includes('mov')
  const h264 = !!v && (v.codec_name === 'h264' || (v.codec_tag_string || '').toLowerCase().includes('avc1'))
  const aac = !a || a.codec_name === 'aac'

  // Якщо файл уже сумісний — повертаємо як є
  if (mp4ish && h264 && aac) {
    const stat = await fs.stat(inputPath)
    return { finalPath: inputPath, finalMime: 'video/mp4', finalSize: stat.size }
  }

  const dir = nodePath.dirname(inputPath)
  const base = nodePath.parse(inputPath).name
  const outputPath = nodePath.join(dir, `${base}.mp4`)

  await new Promise<void>((resolve, reject) => {
    ffmpegLib(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions([
        '-movflags +faststart',
        '-profile:v main',
        '-preset veryfast',
        '-crf 23'
      ])
      .on('error', reject)
      .on('end', () => {
        // Використовуємо твій хелпер, передаючи тільки ім’я оригінального файлу
        const originalFilename = nodePath.basename(inputPath)
        deleteFile(originalFilename)

        resolve()
      })
      .save(outputPath)
  })

  const stat = await fs.stat(outputPath)
  return { finalPath: outputPath, finalMime: 'video/mp4', finalSize: stat.size }
}

export async function ensureM4A(
  inputPath: string
): Promise<{ finalPath: string; finalMime: string; finalSize: number }> {
  const meta = await new Promise<ffmpegLib.FfprobeData>((resolve, reject) => {
    ffmpegLib.ffprobe(inputPath, (err, data) => (err ? reject(err) : resolve(data)));
  });

  // якщо є відеопотік — нехай цим займається ensureMp4 (зовні)
  const hasVideo = meta.streams.some(s => s.codec_type === 'video');
  if (hasVideo) {
    const stat = await fs.stat(inputPath);
    return { finalPath: inputPath, finalMime: 'video/mp4', finalSize: stat.size };
  }

  // 🔴 ВИБИРАЄМО НАЙДОВШИЙ АУДІОТРЕК — ключ до «1 сек»
  const audioStreams = meta.streams
    .map((s, idx) => ({ s, idx }))
    .filter(x => x.s.codec_type === 'audio');

  if (audioStreams.length === 0) {
    // немає аудіо — повертай як є (або кинь помилку на свій розсуд)
    const stat = await fs.stat(inputPath);
    return { finalPath: inputPath, finalMime: 'audio/mp4', finalSize: stat.size };
  }

  // duration у стрімів може бути рядком; конвертимо й беремо максимум
  const best = audioStreams.reduce((best, cur) => {
    const dBest = Number(best.s.duration ?? best.s.tags?.DURATION ?? 0) || 0;
    const dCur  = Number(cur.s.duration  ?? cur.s.tags?.DURATION  ?? 0) || 0;
    return dCur > dBest ? cur : best;
  }, audioStreams[0]);
  const bestAudioIndex = best.idx; // це індекс у "0:a:<index>"

  const dir = nodePath.dirname(inputPath);
  const parsed = nodePath.parse(inputPath);
  const outputPath = nodePath.join(dir, `${parsed.name}.m4a`);

  await new Promise<void>((resolve, reject) => {
    const cmd = ffmpegLib(inputPath)
      // 🔹 беремо САМЕ вибраний аудіопотік
      .outputOptions(['-map', `0:a:${bestAudioIndex}`])
      .noVideo()
      .audioCodec('aac')            // саме перекодування, не copy
      .audioBitrate('128k')
      .audioFrequency(48000)
      .audioChannels(1)             // mono для voice; можна 2
      .inputOptions([
        // iPhone edit lists можуть ламати старт/довжину:
        '-ignore_editlist', '1'
      ])
      .outputOptions([
        '-movflags +faststart',
        '-fflags +genpts',
        '-avoid_negative_ts', 'make_zero',
        '-muxpreload', '0',
        '-muxdelay', '0',
        // Вирівнюємо таймлайн, щоб не було «1 сек»
        '-af', 'aresample=async=1:first_pts=0:min_hard_comp=0.100'
      ])
      .format('mp4')
      .on('error', reject)
      .on('end', () => {
        deleteFile(nodePath.basename(inputPath));
        resolve();
      });

    cmd.save(outputPath);
  });

  const stat = await fs.stat(outputPath);
  return { finalPath: outputPath, finalMime: 'audio/mp4', finalSize: stat.size };
}
