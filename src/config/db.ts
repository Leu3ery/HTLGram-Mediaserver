import mongoose from 'mongoose'
import {config} from './config'
import { CommunicationModel, PayloadModel } from '../modules/media/media.model';
import deleteFile from '../common/utils/utils.deleteFile';

//chat gpt
let cleanupTimer: NodeJS.Timeout

async function startCleanupLoop() {
  let deletedMedias = 0
  let deletedComm   = 0

  try {
    const now = new Date()
    const communications = await CommunicationModel.find({
      expiresAt:  { $lte: now },
      isConfirmed: false
    }).exec()

    for (const comm of communications) {
      const medias = await PayloadModel.find({ communicationId: comm._id }).exec()

      for (const media of medias) {
        try {
          deleteFile(media.path)
        } catch (fsErr) {
          console.error('File delete error:', fsErr)
        }
        await media.deleteOne()
        deletedMedias++
      }

      await comm.deleteOne()
      deletedComm++
    }

    console.log(
      `[${now.toISOString()}] Deleted ${deletedComm} expired communications and ${deletedMedias} medias`
    )

  } catch (err) {
    console.error('Error during cleanup:', err)
  } finally {
    cleanupTimer = setTimeout(startCleanupLoop, 60_000)
  }
}


const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI)
        startCleanupLoop()
        console.log('MongoDB connected')
    } catch (error: any) {
        console.log(error.message)
        console.log("DB error")
        process.exit(1)
    }
}

export default connectDB