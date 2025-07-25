import { HydratedDocument, Model, model, Schema, Types } from "mongoose";
import { CommunicationI, PayloadTypesEnum, PayloadI, CommunicationModelI } from "./media.types";
import { ErrorWithStatus } from "../../common/middleware/errorHandlerMiddleware";


const PayloadSchema = new Schema<PayloadI>(
  {
    communicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Communication',
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(PayloadTypesEnum),
      required: true,
      index: true,
    },
    mime:   { type: String, required: true }, 
    size:   { type: Number, required: true },
    path:   { type: String, required: true }, 
  },
  { timestamps: true }
);


const CommunicationSchema = new Schema<CommunicationI, CommunicationModelI>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    spaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Space',
      required: true,
      index: true,
    },
    text: {
      type: String,
      maxlength: 10000,
      trim: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: { type: Date, index: true },
    editedAt:  { type: Date },
  },
  {
    timestamps: true,
    statics: {
        async findOneOrError(filter: object) {
            const CommunicationModel = await this.findOne(filter).exec();
            
            if (!CommunicationModel) throw new ErrorWithStatus(404, 'Was not found');
            return CommunicationModel;
        }
    },
  }
);

export const PayloadModel = model<PayloadI>('Payload', PayloadSchema);
export const CommunicationModel = model<CommunicationI, CommunicationModelI>('Communication', CommunicationSchema);


// USER MODEL

export interface ImageInfoI {
  path: string;
  size: number;
}

export const imageInfoSchema = new Schema<ImageInfoI>(
  {
    path: { type: String, required: true },
    size: { type: Number, required: true }
  },
  { _id: false }
);

export interface UserI {
    _id: Schema.Types.ObjectId,
    username: string
    password: string,
    name: string,
    description?: string, 
    img: ImageInfoI[],
    friendsCount: number,
    storage: number,
    createdAt: Date,
    updatedAt: Date
}

export interface UserModel extends Model<UserI> {
  findOneOrError(filter: object): Promise<HydratedDocument<UserI>>;
}

const userSchema = new Schema<UserI, UserModel>({
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        img: {
            type: [imageInfoSchema],
            default: [],
            validate: {
                validator: arr => arr.length <= 10,
                message: 'Cannot have more than 10 images'
            }
        },
        friendsCount: {
            type: Number,
            default: 0
        },
        storage: {
            type: Number,
            default: 0, 
            required: true, 
        },
    },
    {   
        statics: {
            async findOneOrError(filter: object) {
                const user = await this.findOne(filter).exec();
                
                if (!user) throw new ErrorWithStatus(404, 'User was not found');
                return user;
            }
        },
        timestamps: true, // createdAt and updatedAt
    })

export const userModel = model<UserI, UserModel>('User', userSchema)
