import Joi from "joi";
import { PayloadTypesEnum } from "./media.types";

export interface uploadMediaSchemaI {
    communicationId: string,
    type: PayloadTypesEnum
}

export const uploadMediaSchema = Joi.object<uploadMediaSchemaI>({
    communicationId: Joi.string().length(24).hex().required(),
    type: Joi.string().trim().valid(...Object.values(PayloadTypesEnum)).required()
})

export interface deleteMediaSchemaI {
    media: [string]
}

export const deleteMediaSchema = Joi.object<deleteMediaSchemaI>({
    media: Joi.array()
    .items(
        Joi.string()
        .length(24)
        .hex()
        .required()
    )
    .min(1)
    .required()
})