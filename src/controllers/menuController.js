import prisma from '../config/database.js';
import { parseExcelMenu } from '../services/excelParser.js';

// Helper function to format menu item with feedback counts
const formatMenuItem = async (item) => {
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

  const comments = await prisma.comment.findMany({
    where: { menuItemId: item.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      text: true,
      createdAt: true,
    },
  });

  return {
    id: item.id,
    name: item.name,
    likes,
    dislikes,
    comments: comments.map(c => ({
      id: c.id,
      text: c.text,
      timestamp: c.createdAt.toISOString(),
    })),
  };
};

// Get all days menu
export const getAllDaysMenu = async (req, res, next) => {
  try {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const menuData = {};

    for (const day of days) {
      const items = await prisma.menuItem.findMany({
        where: { day },
      });

      const breakfast = items.filter(i => i.meal === 'breakfast');
      const lunch = items.filter(i => i.meal === 'lunch');
      const snacks = items.filter(i => i.meal === 'snacks');
      const dinner = items.filter(i => i.meal === 'dinner');

      menuData[day] = {
        date: items[0]?.date || null,
        breakfast: await Promise.all(breakfast.map(formatMenuItem)),
        lunch: await Promise.all(lunch.map(formatMenuItem)),
        snacks: await Promise.all(snacks.map(formatMenuItem)),
        dinner: await Promise.all(dinner.map(formatMenuItem)),
      };
    }

    res.json({ data: menuData });
  } catch (error) {
    next(error);
  }
};

// Get menu for specific day
export const getDayMenu = async (req, res, next) => {
  try {
    const { day } = req.params;
    const items = await prisma.menuItem.findMany({
      where: { day: day.toLowerCase() },
    });

    const menuData = {
      date: items[0]?.date || null,
      breakfast: await Promise.all(
        items.filter(i => i.meal === 'breakfast').map(formatMenuItem)
      ),
      lunch: await Promise.all(
        items.filter(i => i.meal === 'lunch').map(formatMenuItem)
      ),
      snacks: await Promise.all(
        items.filter(i => i.meal === 'snacks').map(formatMenuItem)
      ),
      dinner: await Promise.all(
        items.filter(i => i.meal === 'dinner').map(formatMenuItem)
      ),
    };

    res.json({ data: menuData });
  } catch (error) {
    next(error);
  }
};

// Update menu from Excel
export const updateMenuFromExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let parseResult;
    try {
      parseResult = await parseExcelMenu(req.file.buffer);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: parseError.message || 'Failed to parse Excel file. Please check the file format.',
      });
    }
    
    const { menuData, errors, warnings, stats } = parseResult;

    // If there are critical errors (no data), return error
    if (errors.length > 0 && stats && stats.totalItems === 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(' '),
        warnings: warnings || [],
        stats: stats || {},
      });
    }
    
    // Validate menuData exists
    if (!menuData || typeof menuData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse menu data from Excel file. Please check the file format.',
      });
    }

    // Transaction to update all menu items
    await prisma.$transaction(async (tx) => {
      // Delete existing menu items
      await tx.menuItem.deleteMany({});

      // Create new menu items (even if some days are missing)
      for (const [day, dayData] of Object.entries(menuData)) {
        for (const [meal, items] of Object.entries(dayData)) {
          if (meal !== 'date' && Array.isArray(items) && items.length > 0) {
            await tx.menuItem.createMany({
              data: items.map(item => ({
                name: item.name,
                day: day,
                meal: meal,
                date: dayData.date ? new Date(dayData.date) : null,
              })),
            });
          }
        }
      }
    });

    // Build success message with warnings
    let message = 'Menu updated successfully!';
    if (warnings.length > 0) {
      message += ` Warnings: ${warnings.join('; ')}`;
    }
    if (stats.daysMissing > 0) {
      message += ` Note: ${stats.daysMissing} day(s) missing from file.`;
    }

    res.json({
      success: true,
      message,
      warnings: warnings.length > 0 ? warnings : undefined,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// Add manual menu item
export const addManualMenuItem = async (req, res, next) => {
  try {
    const { day, meal, foodName } = req.body;

    const menuItem = await prisma.menuItem.create({
      data: {
        name: foodName,
        day: day.toLowerCase(),
        meal: meal.toLowerCase(),
      },
    });

    const formattedItem = await formatMenuItem(menuItem);
    res.json({ success: true, data: formattedItem });
  } catch (error) {
    next(error);
  }
};




