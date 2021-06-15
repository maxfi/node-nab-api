import { readFile } from 'fs/promises';
import path from 'path';

export const readFileFromPath = (pathName: string) =>
  readFile(path.resolve(__dirname, '../..', pathName), 'utf8');
