import express from "express"
import errorHandler from "./common/middleware/errorHandlerMiddleware"
import notFound from "./common/middleware/notFoundMiddleware"
import rateLimit from 'express-rate-limit'
import path from "path"
import fs from 'fs'
import cors from 'cors'


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

app.use('/public', express.static(publicDir))
app.use(limiter)
app.use(cors())
app.use(express.json())



import mediaRouter from './modules/media/media.routes'

app.use('/media', mediaRouter)


app.use(errorHandler)
app.use(notFound)

export default app
