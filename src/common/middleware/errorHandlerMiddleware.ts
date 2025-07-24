import {Request, Response, NextFunction} from 'express'
import deleteFile from '../utils/utils.deleteFile'
import { MulterError } from 'multer'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'

export class ErrorWithStatus extends Error {
    status?: number

    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
}

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err)

    // chat gpt
    if (req.file) {
        deleteFile(req.file.filename)
    }

    // chat gpt
    if (req.files) {
        const filesArray: Express.Multer.File[] = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat() as Express.Multer.File[]
        filesArray.forEach(file => deleteFile(file.filename))
    }

    

    if (err instanceof ErrorWithStatus) {
        const status = err.status || 500
        const message = err.message || "Internal server error"
        res.status(status).json({message});
    } else if (err instanceof MulterError) {
        res.status(400).json({ message: `Fail error: ${err.message}` })
    } else if (err instanceof TokenExpiredError) {
        res.status(401).json({ message: `Token expired: ${err.message}` });
    } else if (err instanceof JsonWebTokenError) {
        res.status(401).json({ message: `Invalid token: ${err.message}` });
    } else {
        res.status(500).json({message:"Internal server error"});
    }
}

export default errorHandler