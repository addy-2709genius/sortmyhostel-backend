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

// Get yesterday's wastage
export const getYesterdayWastage = async (req, res, next) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const wastage = await prisma.foodWastage.findUnique({
      where: { date: yesterday },
    });

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

    const wastage = await prisma.foodWastage.upsert({
      where: { date: yesterday },
      update: {
        cooked: parseFloat(cooked),
        wasted: parseFloat(wasted),
      },
      create: {
        date: yesterday,
        cooked: parseFloat(cooked),
        wasted: parseFloat(wasted),
      },
    });

    res.json({ success: true, data: wastage });
  } catch (error) {
    next(error);
  }
};



