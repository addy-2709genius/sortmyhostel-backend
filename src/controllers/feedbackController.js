import prisma from '../config/database.js';

// Submit feedback (like/dislike)
export const submitFeedback = async (req, res, next) => {
  try {
    const { foodId, feedbackType } = req.body;
    const studentId = req.studentId; // Authenticated student ID from middleware
    const userId = req.headers['x-user-id'] || req.body.userId; // Anonymous user ID (fallback)

    // Require either student authentication or anonymous user ID
    if (!studentId && !userId) {
      return res.status(401).json({ error: 'Authentication required. Please login to give feedback.' });
    }

    // Use studentId if authenticated, otherwise use userId for anonymous
    const identifier = studentId ? { studentId } : { userId };

    // Check if user already voted this type (using findFirst since we removed unique constraint)
    const existingVote = await prisma.feedback.findFirst({
      where: {
        menuItemId: foodId,
        type: feedbackType,
        ...identifier,
      },
    });

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted' });
    }

    // Remove opposite vote if exists
    const oppositeType = feedbackType === 'like' ? 'dislike' : 'like';
    await prisma.feedback.deleteMany({
      where: {
        menuItemId: foodId,
        ...identifier,
        type: oppositeType,
      },
    });

    // Create new feedback
    await prisma.feedback.create({
      data: {
        menuItemId: foodId,
        ...identifier,
        type: feedbackType,
      },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Submit comment
export const submitComment = async (req, res, next) => {
  try {
    const { foodId, comment } = req.body;
    const studentId = req.studentId; // Authenticated student ID from middleware
    const userId = req.headers['x-user-id'] || req.body.userId; // Anonymous user ID (fallback)

    // Require either student authentication or anonymous user ID
    if (!studentId && !userId) {
      return res.status(401).json({ error: 'Authentication required. Please login to add comments.' });
    }

    // Use studentId if authenticated, otherwise use userId for anonymous
    const data = {
      text: comment.trim(),
      menuItemId: foodId,
    };
    
    if (studentId) {
      data.studentId = studentId;
    } else {
      data.userId = userId;
    }

    const commentRecord = await prisma.comment.create({
      data,
    });

    res.json({
      success: true,
      data: {
        id: commentRecord.id,
        text: commentRecord.text,
        timestamp: commentRecord.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete comment (admin only)
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Get all comments (for community feedback section)
export const getAllComments = async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        menuItem: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const allComments = await Promise.all(
      comments.map(async (comment) => {
        const likes = await prisma.feedback.count({
          where: {
            menuItemId: comment.menuItemId,
            type: 'like',
          },
        });
        const dislikes = await prisma.feedback.count({
          where: {
            menuItemId: comment.menuItemId,
            type: 'dislike',
          },
        });

        return {
          id: comment.id,
          text: comment.text,
          timestamp: comment.createdAt.toISOString(),
          foodName: comment.menuItem.name,
          foodId: comment.menuItemId,
          day: comment.menuItem.day,
          meal: comment.menuItem.meal,
          date: comment.menuItem.date,
          likes,
          dislikes,
        };
      })
    );

    res.json({ data: allComments });
  } catch (error) {
    next(error);
  }
};

// Get disliked food issues
export const getDislikedFoodIssues = async (req, res, next) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: {
        feedbacks: {
          some: { type: 'dislike' },
        },
      },
      include: {
        feedbacks: true,
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const issues = await Promise.all(
      items.map(async (item) => {
        const likes = await prisma.feedback.count({
          where: {
            menuItemId: item.id,
            type: 'like',
          },
        });
        const dislikes = await prisma.feedback.count({
          where: {
            menuItemId: item.id,
            type: 'dislike',
          },
        });

        return {
          foodId: item.id,
          foodName: item.name,
          day: item.day,
          meal: item.meal,
          date: item.date,
          likes,
          dislikes,
          comments: item.comments.map(c => ({
            id: c.id,
            text: c.text,
            timestamp: c.createdAt.toISOString(),
          })),
        };
      })
    );

    // Sort by dislikes (highest first)
    issues.sort((a, b) => b.dislikes - a.dislikes);

    res.json({ data: issues });
  } catch (error) {
    next(error);
  }
};



