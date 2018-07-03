import fs from 'fs'
import path from 'path'
import pify from 'pify'

export default x =>
  pify(fs.readFile)(path.resolve(__dirname, '../..', x), 'utf8')
