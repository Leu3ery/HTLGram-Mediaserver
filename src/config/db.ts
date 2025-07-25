import mongoose from 'mongoose'
import {config} from './config'
import { CommunicationModel } from '../modules/media/media.model';

//chat gpt
let cleanupTimer: NodeJS.Timeout

async function startCleanupLoop() {
  try {
    const now = new Date()
    const { deletedCount } = await CommunicationModel.deleteMany({
      expiresAt:  { $lte: now },
      isConfirmed: false
    })
    console.log(`[${now.toISOString()}] Deleted ${deletedCount} expired communications`)
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