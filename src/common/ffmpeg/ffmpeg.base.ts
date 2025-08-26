import nodePath from 'node:path';
import fs from 'node:fs/promises';
import ffmpegLib from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
import deleteFile from '../../common/utils/utils.deleteFile';

ffmpegLib.setFfmpegPath(ffmpegPath.path);
ffmpegLib.setFfprobePath(ffprobePath.path);

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
        const originalFilename = nodePath.basename(inputPath)
        deleteFile(originalFilename)

        resolve()
      })
      .save(outputPath)
  })

  const stat = await fs.stat(outputPath)
  return { finalPath: outputPath, finalMime: 'video/mp4', finalSize: stat.size }
}