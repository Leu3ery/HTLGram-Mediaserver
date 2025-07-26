import { validationWrapper } from "../../common/utils/utils.wrappers";
import { Request, Response } from "express";
import { deleteMediaSchema, uploadMediaSchema } from "./media.validation";
import mediaService from "./media.servise";
import { ErrorWithStatus } from "../../common/middleware/errorHandlerMiddleware";
import { config } from "../../config/config";

const mediaController = {
    async upload(req: Request, res: Response) {
        if (!req.file) throw new ErrorWithStatus(400, "You need to upload file")
        if (req.file.size > 1024 * 1024 * config.MAX_FILE_SIZE) throw new ErrorWithStatus(400, `File cann't be larger as ${config.MAX_FILE_SIZE}MB`)
        const userId = res.locals.user.userId
        const validated = validationWrapper(uploadMediaSchema, req.body)
        const path_splited = req.file?.path.split('/')
        const payload = await mediaService.upload(validated, userId, req.file?.mimetype, req.file?.size, path_splited[path_splited.length-1])
        res.status(200).json({data: payload})
    },

    // async delete(req: Request, res: Response) {
    //     const validated = validationWrapper(deleteMediaSchema, req.body)
    //     await mediaService.delete(validated)
    //     res.status(200)
    // }
}

export default mediaController