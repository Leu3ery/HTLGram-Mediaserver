import path from 'path'
import fs from 'fs'
import { publicDir } from '../../app'

const deleteFile = (filename: string) => {
  const filePath = path.join(publicDir, filename)

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, accessErr => {
    if (accessErr) {
      if (accessErr.code === 'ENOENT') {
        console.warn(`File not found: ${filePath}`)
      } else {
        console.error('Error checking file accessibility', accessErr)
      }
      return
    }

    // If file exists, delete it
    fs.unlink(filePath, unlinkErr => {
      if (unlinkErr) {
        console.error('Failed to delete file', unlinkErr)
      }
    })
  })
}

export default deleteFile
