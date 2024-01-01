import { Router } from 'express';
import {
  createClient,
  getClient,
  getClients,
} from '../controller/client.controller';
import multer from 'multer';
import { uploadPath } from '../config/path.config';
import { generateCompleteFileName } from '../utils/fileHandler';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath.client.logo);
  },

  filename: (req, file, cb) => {
    cb(null, generateCompleteFileName({ file }));
  },
});

const logoUpload = multer({
  storage,
});
const router = Router();

router.get('/', getClients);
router.get('/:clientId', getClient);
router.post('/', logoUpload.single('logo'), createClient);

export default router;
