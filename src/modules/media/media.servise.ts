import { Types } from "mongoose"
import { deleteMediaSchemaI, uploadMediaSchemaI } from "./media.validation"
import { CommunicationModel, PayloadModel, userModel } from "./media.model"
import { ErrorWithStatus } from "../../common/middleware/errorHandlerMiddleware"
import { config } from "../../config/config"
import deleteFile from "../../common/utils/utils.deleteFile"

const mediaService = {
    async upload(validated: uploadMediaSchemaI, userId: Types.ObjectId, mime: string, size: number, path: string) {
        const communication = await CommunicationModel.findOneOrError({_id: validated.communicationId, senderId: userId})
        if (communication.isConfirmed) throw new ErrorWithStatus(400, "You cann't add files to closed communication")
        const user = await userModel.findOneOrError({_id: userId})
        if (user.storage > 1024 * 1024 * config.MAX_USER_STORAGE) throw new ErrorWithStatus(400, "Your storage is full")
        user.storage += size
        await user.save()
        return await PayloadModel.create({communicationId: validated.communicationId, owner: userId, type: validated.type, mime, size, path})
    },

    async delete(data: deleteMediaSchemaI) {
        for (let mediaId of data.media) {
            const media = await PayloadModel.findById(mediaId).exec()
            if (media) {
                deleteFile(media.path)
            }
        }
    }
}

export default mediaService