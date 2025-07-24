import mongoose from 'mongoose'
import {config} from './config'

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGO_URI)
        console.log('MongoDB connected')
    } catch (error: any) {
        console.log(error.message)
        console.log("DB error")
        process.exit(1)
    }
}

export default connectDB