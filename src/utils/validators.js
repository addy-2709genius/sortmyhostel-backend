import { body, validationResult } from 'express-validator';

export const validateFeedback = [
  body('foodId').notEmpty().withMessage('Food ID is required'),
  body('feedbackType').isIn(['like', 'dislike']).withMessage('Feedback type must be like or dislike'),
];

export const validateComment = [
  body('foodId').notEmpty().withMessage('Food ID is required'),
  body('comment').trim().isLength({ min: 5 }).withMessage('Comment must be at least 5 characters'),
];

export const validateWastage = [
  body('cooked').isFloat({ min: 0 }).withMessage('Cooked amount must be a positive number'),
  body('wasted').isFloat({ min: 0 }).withMessage('Wasted amount must be a positive number'),
  body('wasted').custom((value, { req }) => {
    if (parseFloat(value) > parseFloat(req.body.cooked)) {
      throw new Error('Wasted amount cannot exceed cooked amount');
    }
    return true;
  }),
];

export const validateMenuItem = [
  body('day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day'),
  body('meal').isIn(['breakfast', 'lunch', 'snacks', 'dinner'])
    .withMessage('Invalid meal type'),
  body('foodName').trim().isLength({ min: 2 }).withMessage('Food name must be at least 2 characters'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};




