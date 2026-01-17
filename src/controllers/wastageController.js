import prisma from '../config/database.js';

// Get wastage data (last 7 days)
export const getWastageData = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const wastageRecords = await prisma.foodWastage.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { date: 'asc' },
    });

    const data = wastageRecords.map((record) => ({
      day: new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' }),
      cooked: record.cooked,
      wasted: record.wasted,
    }));

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

// Get yesterday's wastage (or most recent wastage from last 7 days)
export const getYesterdayWastage = async (req, res, next) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setMinutes(0, 0, 0);
    yesterday.setSeconds(0, 0);
    yesterday.setMilliseconds(0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Try to find wastage for yesterday using date range
    let wastage = await prisma.foodWastage.findFirst({
      where: {
        date: {
          gte: yesterday,
          lte: yesterdayEnd,
        },
      },
      orderBy: { date: 'desc' },
    });

    // If not found, get the most recent wastage from last 7 days
    if (!wastage) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      wastage = await prisma.foodWastage.findFirst({
        where: {
          date: {
            gte: sevenDaysAgo,
          },
        },
        orderBy: { date: 'desc' },
      });
    }

    if (!wastage) {
      return res.json({
        data: {
          wasted: 0,
          cooked: 0,
          date: yesterday.toISOString().split('T')[0],
        },
      });
    }

    res.json({
      data: {
        wasted: wastage.wasted,
        cooked: wastage.cooked,
        date: wastage.date.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// Submit wastage
export const submitWastage = async (req, res, next) => {
  try {
    const { cooked, wasted } = req.body;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setMinutes(0, 0, 0);
    yesterday.setSeconds(0, 0);
    yesterday.setMilliseconds(0);

    // First try to find existing record with date range
    const existingWastage = await prisma.foodWastage.findFirst({
      where: {
        date: {
          gte: new Date(yesterday.getTime()),
          lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    let wastage;
    if (existingWastage) {
      // Update existing record
      wastage = await prisma.foodWastage.update({
        where: { id: existingWastage.id },
        data: {
          cooked: parseFloat(cooked),
          wasted: parseFloat(wasted),
        },
      });
    } else {
      // Create new record
      wastage = await prisma.foodWastage.create({
        data: {
          date: yesterday,
          cooked: parseFloat(cooked),
          wasted: parseFloat(wasted),
        },
      });
    }

    res.json({ success: true, data: wastage });
  } catch (error) {
    next(error);
  }
};




