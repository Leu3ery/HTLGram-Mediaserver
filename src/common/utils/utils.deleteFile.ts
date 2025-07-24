import path from 'path'
import fs from 'fs'
import { publicDir } from '../../app'

const deleteFile = (filename: string) => {
    const filePath = path.join(publicDir, filename)
    fs.unlink(filePath, unlinkErr => {
        if (unlinkErr) {
            console.error('File couldnt be deleted', unlinkErr)
        }
    })
}

export default deleteFile