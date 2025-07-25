// chat gpt
import multer from 'multer'
import path from 'path'
import {publicDir} from '../../app'

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, publicDir)
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + ext)
  }
})


export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } 
})
