import express from "express"
import errorHandler from "./common/middleware/errorHandlerMiddleware"
import notFound from "./common/middleware/notFoundMiddleware"
import rateLimit from 'express-rate-limit'
import path from "path"
import fs from 'fs'
import cors from 'cors'

import { ErrorWithStatus } from './common/middleware/errorHandlerMiddleware'
import { Request, Response } from "express";

const app = express()

// limiter
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 1 minutes"
})

// Public dir
export const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log(`Created missing directory: ${publicDir}`);
}


// app.use('/public', express.static(publicDir))


app.use(limiter)
app.use(cors())
app.use(express.json())



import mediaRouter from './modules/media/media.routes'
import { PayloadModel } from "./modules/media/media.model"

app.get('/public/:id', async (req: Request, res: Response) => {
  const media = await PayloadModel.findOne({path: req.params.id})
  if (!media) throw new ErrorWithStatus(404, 'Not found')

  const filePath = path.join(publicDir, media.path)
  const stat = fs.statSync(filePath)
  const range = req.headers.range 
  const contentType = media.mime || 'application/octet-stream'

  // важливо для iOS – показати розширення у filename
  res.setHeader('Content-Disposition', `inline; filename="${media.path}"`)
  res.setHeader('Accept-Ranges', 'bytes')

  if (!range) {
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', stat.size.toString())
    fs.createReadStream(filePath).pipe(res)
    return
  }

  const [startStr, endStr] = range.replace(/bytes=/, '').split('-')
  const start = parseInt(startStr, 10)
  const end = endStr ? parseInt(endStr, 10) : stat.size - 1

  if (start >= stat.size || end >= stat.size) {
    res.status(416).set('Content-Range', `bytes */${stat.size}`).end()
    return
  }

  res.status(206).set({
    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
    'Content-Length': (end - start + 1).toString(),
    'Content-Type': contentType
  })

  fs.createReadStream(filePath, { start, end }).pipe(res)
})

app.use('/media', mediaRouter)


app.use(errorHandler)
app.use(notFound)

export default app
