import express from 'express';
import multer from 'multer';
import {
  getAllDaysMenu,
  getDayMenu,
  updateMenuFromExcel,
  addManualMenuItem,
  removeMenuItem,
} from '../controllers/menuController.js';
import { validateMenuItem, handleValidationErrors } from '../utils/validators.js';
import { authenticateAdmin, optionalStudentAuth } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Menu routes - optional student auth to show user-specific feedback status
router.get('/all-days', optionalStudentAuth, getAllDaysMenu);
router.get('/day/:day', optionalStudentAuth, getDayMenu);
router.post('/upload-excel', authenticateAdmin, upload.single('file'), updateMenuFromExcel);
router.post('/add-item', authenticateAdmin, validateMenuItem, handleValidationErrors, addManualMenuItem);
router.delete('/remove-item', authenticateAdmin, removeMenuItem);

export default router;




