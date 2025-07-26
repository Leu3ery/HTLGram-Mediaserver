import {Request, Response, NextFunction} from 'express'
import { ErrorWithStatus } from './errorHandlerMiddleware'
import path from 'path'
import fs from 'fs'
import { publicDir } from '../../app'
import jwt from 'jsonwebtoken'

const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../../../jwtRS256.key.pub'))

const serverJWTMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) throw new ErrorWithStatus(401, "No authorization header find")
        jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'], audience: 'media-server', issuer: 'main-server' }, (err, decoded) => {
            if (err) return res.status(403).json({ error: 'Invalid token', details: err.message });
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