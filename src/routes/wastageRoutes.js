import express from 'express';
import {
  getWastageData,
  getYesterdayWastage,
  submitWastage,
} from '../controllers/wastageController.js';
import { validateWastage, handleValidationErrors } from '../utils/validators.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getWastageData);
router.get('/yesterday', getYesterdayWastage);
router.post('/submit', authenticateAdmin, validateWastage, handleValidationErrors, submitWastage);

export default router;



