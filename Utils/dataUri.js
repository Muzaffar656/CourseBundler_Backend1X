import DataUriParser from 'datauri/parser.js'
import path, { parse } from 'path'

const getDataUri = (file) => {

    const parser = new DataUriParser()
    const extName = path.extname(file.originalname).toString()
  
    console.log(parser.format(extName,file.buffer))
    return parser.format(extName,file.buffer)
}
export default getDataUri