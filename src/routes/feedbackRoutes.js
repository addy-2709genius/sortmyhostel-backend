import express from 'express';
import {
  submitFeedback,
  submitComment,
  deleteComment,
  getAllComments,
  getDislikedFoodIssues,
} from '../controllers/feedbackController.js';
import { validateFeedback, validateComment, handleValidationErrors } from '../utils/validators.js';
import { authenticateAdmin, optionalStudentAuth } from '../middleware/auth.js';

const router = express.Router();

// Feedback routes - optional student auth (can use anonymous userId if not logged in)
router.post('/submit', optionalStudentAuth, validateFeedback, handleValidationErrors, submitFeedback);
router.post('/comment', optionalStudentAuth, validateComment, handleValidationErrors, submitComment);
router.delete('/comment/:commentId', authenticateAdmin, deleteComment);
router.get('/all-comments', getAllComments);
router.get('/disliked-issues', getDislikedFoodIssues);

export default router;



