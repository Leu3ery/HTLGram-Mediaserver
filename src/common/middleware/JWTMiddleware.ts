import {Request, Response, NextFunction} from 'express'
import { ErrorWithStatus } from './errorHandlerMiddleware'
import jwt from 'jsonwebtoken'
import { config } from '../../config/config'

const JWTMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) throw new ErrorWithStatus(401, "No authorization header find")
        const data = jwt.verify(token, config.JWT_SECRET)
        res.locals.user = data
        next()
    } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error("Unexpected error");
        next(new ErrorWithStatus(401, err.message));
    }
    
}

export default JWTMiddleware