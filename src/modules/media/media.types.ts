import { HydratedDocument, Model, Schema } from "mongoose"

export enum PayloadTypesEnum {
    PHOTOS  = "photo",
    VIDEOS  = "video",
    FILE = "file",
    AUDIO = "audio",
    VIDEOMESSAGE = "video_message",
    STICKER = "sticker",
}

export interface PayloadI extends Document {
    communicationId: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    type: PayloadTypesEnum,
    mime: string,
    size: number,
    path: string,
    createdAt: Date,
    updatedAt: Date,
}


export interface CommunicationI extends Document {
    senderId: Schema.Types.ObjectId,
    spaceId: Schema.Types.ObjectId,
    text?: string,
    isConfirmed:  boolean,
    expiresAt: Date,
    editedAt: Date, 
    createdAt: Date,
    updatedAt: Date
}

export interface CommunicationModelI extends Model<CommunicationI> {
  findOneOrError(filter: object): Promise<HydratedDocument<CommunicationI>>;
}