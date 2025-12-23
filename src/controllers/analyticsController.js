import prisma from '../config/database.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const items = await prisma.menuItem.findMany();

    const foodItems = await Promise.all(
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
          id: item.id,
          name: item.name,
          likes,
          dislikes,
        };
      })
    );

    const mostLiked = foodItems.reduce(
      (max, item) => (item.likes > max.likes ? item : max),
      foodItems[0] || { name: 'N/A', likes: 0 }
    );

    const mostDisliked = foodItems.reduce(
      (max, item) => (item.dislikes > max.dislikes ? item : max),
      foodItems[0] || { name: 'N/A', dislikes: 0 }
    );

    const totalFeedback = foodItems.reduce(
      (sum, item) => sum + item.likes + item.dislikes,
      0
    );

    res.json({
      data: {
        mostLiked,
        mostDisliked,
        totalFeedback,
        foodItems,
      },
    });
  } catch (error) {
    next(error);
  }
};



