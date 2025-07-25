import dotenv from 'dotenv'

dotenv.config()

interface Config {
    PORT: number,
    JWT_SECRET: string,
    MONGO_URI: string,
    MAX_FILE_SIZE: number,
    MAX_USER_STORAGE: number
}

export const config: Config = {
    PORT: Number(process.env.PORT) || 3001,
    JWT_SECRET: process.env.JWT_SECRET_ADMIN || "secret",
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/htlgram",
    MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE) || 50,
    MAX_USER_STORAGE: Number(process.env.MAX_USER_STORAGE) || 50
}