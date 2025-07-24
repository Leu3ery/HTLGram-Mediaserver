import app from './app'
import connectDB from './config/db'
import {config} from './config/config'

const startServer = async () => {
    try {
        await connectDB()

        app.listen(config.PORT, () => {
            console.log(`Server runs on http://localhost:${config.PORT}`)
        })
    } catch (error: any) {
        console.log(error.message)
        process.exit(1)
    }
}

startServer()