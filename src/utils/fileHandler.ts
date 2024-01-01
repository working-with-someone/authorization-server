import { v4 } from 'uuid';
import mime from 'mime-types';

interface generateNameOption {
  file: Express.Multer.File;
  name?: string;
}

export function generateCompleteFileName(option: generateNameOption) {
  const extension = mime.extension(option.file.mimetype);

  return option.name ? option.name + '.' + extension : v4() + '.' + extension;
}
