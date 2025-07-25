import Joi from "joi";
import { PayloadTypesEnum } from "./media.types";

export interface uploadMediaSchemaI {
    communicationId: string,
    type: PayloadTypesEnum
}

export const uploadMediaSchema = Joi.object({
    communicationId: Joi.string().trim().min(3).max(64).required(),
    type: Joi.string().trim().valid(...Object.values(PayloadTypesEnum)).required()
})