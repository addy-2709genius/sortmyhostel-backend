import express from 'express';
import {
  submitFeedback,
  submitComment,
  deleteComment,
  getAllComments,
  getDislikedFoodIssues,
} from '../controllers/feedbackController.js';
import { validateFeedback, validateComment, handleValidationErrors } from '../utils/validators.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', validateFeedback, handleValidationErrors, submitFeedback);
router.post('/comment', validateComment, handleValidationErrors, submitComment);
router.delete('/comment/:commentId', authenticateAdmin, deleteComment);
router.get('/all-comments', getAllComments);
router.get('/disliked-issues', getDislikedFoodIssues);

export default router;



