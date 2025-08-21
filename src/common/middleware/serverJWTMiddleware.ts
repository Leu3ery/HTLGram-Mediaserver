import {Request, Response, NextFunction} from 'express'
import { ErrorWithStatus } from './errorHandlerMiddleware'
import jwt from 'jsonwebtoken'
import { config } from '../../config/config'

const serverJWTMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) throw new ErrorWithStatus(401, "No authorization header find")
        jwt.verify(token, config.PUBLIC_KEY_BASE64, { algorithms: ['RS256'], audience: 'media-server', issuer: 'main-server' }, (err, decoded) => {
            if (err) throw new ErrorWithStatus(403, 'Invalid token')
        })
        next()
    } catch (e: unknown) {
        if (e instanceof jwt.JsonWebTokenError) {
            return next(new ErrorWithStatus(403, e.message));
        }

        const err = e instanceof Error ? e : new Error("Unexpected error");
        next(new ErrorWithStatus(401, err.message));
    }
    
}

export default serverJWTMiddleware