import JWTMiddleware from '../../common/middleware/JWTMiddleware'
import express from 'express'
import mediaController from './media.controller'
import { ErrorWrapper } from '../../common/utils/utils.wrappers'
import { upload } from '../../common/multer/multer.main'
import serverJWTMiddleware from '../../common/middleware/serverJWTMiddleware'

const router = express.Router()

router.post('/', JWTMiddleware, upload.single("file"), ErrorWrapper(mediaController.upload))
router.delete('/', serverJWTMiddleware, ErrorWrapper(mediaController.delete))

export default router