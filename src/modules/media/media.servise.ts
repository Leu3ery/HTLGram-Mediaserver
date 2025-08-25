import { Types } from "mongoose"
import { deleteMediaSchemaI, uploadMediaSchemaI } from "./media.validation"
import { CommunicationModel, PayloadModel, userModel } from "./media.model"
import { ErrorWithStatus } from "../../common/middleware/errorHandlerMiddleware"
import { config } from "../../config/config"
import deleteFile from "../../common/utils/utils.deleteFile"

export type MediaResponse = {
    id: string,
    communicationId: string,
    owner: string,
    type: string,
    mime: string,
    size: number,
    path: string,
    createdAt: Date,
    updatedAt: Date,
}

const mediaService = {
    async upload(validated: uploadMediaSchemaI, userId: Types.ObjectId, mime: string, size: number, path: string): Promise<MediaResponse> {
        const communication = await CommunicationModel.findOneOrError({_id: validated.communicationId, senderId: userId})
        if (communication.isConfirmed) throw new ErrorWithStatus(400, "You cann't add files to closed communication")
        const mediaCount = await PayloadModel.countDocuments({communicationId: validated.communicationId}).exec()
        if (mediaCount > 10) throw new ErrorWithStatus(400, 'Cannot add more than 10 media items to this communication')
        const user = await userModel.findOneOrError({_id: userId})
        if (user.storage > 1024 * 1024 * config.MAX_USER_STORAGE) throw new ErrorWithStatus(400, "Your storage is full")
        user.storage += size
        await user.save()
        const media =  await PayloadModel.create({communicationId: validated.communicationId, spaceId: communication.spaceId, owner: userId, type: validated.type, mime, size, path})
        return {
            id: media._id.toString(),
            communicationId: media.communicationId.toString(),
            owner: media.owner.toString(),
            type: media.type,
            mime: media.mime,
            size: media.size,
            path: media.path,
            createdAt: media.createdAt,
            updatedAt: media.updatedAt
        }
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