import express from 'express';
import multer from 'multer';
import {
  getAllDaysMenu,
  getDayMenu,
  updateMenuFromExcel,
  addManualMenuItem,
} from '../controllers/menuController.js';
import { validateMenuItem, handleValidationErrors } from '../utils/validators.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/all-days', getAllDaysMenu);
router.get('/day/:day', getDayMenu);
router.post('/upload-excel', upload.single('file'), updateMenuFromExcel);
router.post('/add-item', validateMenuItem, handleValidationErrors, addManualMenuItem);

export default router;



