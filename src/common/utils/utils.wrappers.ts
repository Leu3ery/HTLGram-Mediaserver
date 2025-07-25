import { ErrorWithStatus } from '../middleware/errorHandlerMiddleware';
import {ObjectSchema} from 'joi'
import {Request, Response, NextFunction} from 'express'


export function validationWrapper(schema: ObjectSchema, data: any) {
    const { error, value } = schema.validate(data);
    if (error) {
        throw new ErrorWithStatus(400, error.message)
    } else {
        return value
    }
}

export function ErrorWrapper(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
        await fn(req, res, next)
    } catch (error) {
        next(error)
    }
  };
}
