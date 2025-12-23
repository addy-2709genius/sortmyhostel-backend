import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'sortmyhostel@aaditya.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'sorted@123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Sample menu items with dates
  const today = new Date();
  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() - today.getDay() + 1); // Get Monday of current week
  
  const sampleMenuItems = [
    // Monday
    { name: 'Poha', day: 'monday', meal: 'breakfast', date: new Date(mondayDate) },
    { name: 'Tea / Coffee', day: 'monday', meal: 'breakfast', date: new Date(mondayDate) },
    { name: 'Dal Tadka', day: 'monday', meal: 'lunch', date: new Date(mondayDate) },
    { name: 'Jeera Rice', day: 'monday', meal: 'lunch', date: new Date(mondayDate) },
    { name: 'Samosa', day: 'monday', meal: 'snacks', date: new Date(mondayDate) },
    { name: 'Fried Rice', day: 'monday', meal: 'dinner', date: new Date(mondayDate) },
    
    // Tuesday
    { name: 'Veg Upma', day: 'tuesday', meal: 'breakfast', date: new Date(mondayDate.getTime() + 86400000) },
    { name: 'Tea / Coffee', day: 'tuesday', meal: 'breakfast', date: new Date(mondayDate.getTime() + 86400000) },
    { name: 'Dal Makhani', day: 'tuesday', meal: 'lunch', date: new Date(mondayDate.getTime() + 86400000) },
    { name: 'Roti', day: 'tuesday', meal: 'lunch', date: new Date(mondayDate.getTime() + 86400000) },
    { name: 'Pakora', day: 'tuesday', meal: 'snacks', date: new Date(mondayDate.getTime() + 86400000) },
    { name: 'Biryani', day: 'tuesday', meal: 'dinner', date: new Date(mondayDate.getTime() + 86400000) },
  ];

  // Delete existing sample items first (optional - comment out if you want to keep existing)
  // await prisma.menuItem.deleteMany({
  //   where: {
  //     day: { in: ['monday', 'tuesday'] }
  //   }
  // });

  const createdItems = [];
  for (const item of sampleMenuItems) {
    // Check if item already exists
    const existing = await prisma.menuItem.findFirst({
      where: {
        name: item.name,
        day: item.day,
        meal: item.meal,
      },
    });
    
    if (!existing) {
      const menuItem = await prisma.menuItem.create({
        data: item,
      });
      createdItems.push(menuItem);
    } else {
      createdItems.push(existing);
    }
  }

  console.log('✅ Sample menu items created');

  // Create sample feedback (likes and dislikes)
  const sampleUserIds = ['user1', 'user2', 'user3', 'user4', 'user5'];
  let feedbackCount = 0;
  
  for (const item of createdItems) {
    // Add some likes
    const numLikes = Math.floor(Math.random() * 10) + 5; // 5-15 likes
    for (let i = 0; i < numLikes; i++) {
      const userId = sampleUserIds[Math.floor(Math.random() * sampleUserIds.length)] + '_' + i;
      try {
        await prisma.feedback.create({
          data: {
            type: 'like',
            menuItemId: item.id,
            userId: userId,
          },
        });
        feedbackCount++;
      } catch (e) {
        // Skip if duplicate
      }
    }
    
    // Add some dislikes (fewer than likes)
    const numDislikes = Math.floor(Math.random() * 5) + 1; // 1-6 dislikes
    for (let i = 0; i < numDislikes; i++) {
      const userId = sampleUserIds[Math.floor(Math.random() * sampleUserIds.length)] + '_dislike_' + i;
      try {
        await prisma.feedback.create({
          data: {
            type: 'dislike',
            menuItemId: item.id,
            userId: userId,
          },
        });
        feedbackCount++;
      } catch (e) {
        // Skip if duplicate
      }
    }
    
    // Add some comments for items with dislikes
    if (numDislikes > 0) {
      const numComments = Math.floor(Math.random() * 3) + 1; // 1-4 comments
      for (let i = 0; i < numComments; i++) {
        const commentTexts = [
          'Too spicy for my taste',
          'Not fresh enough',
          'Could use more salt',
          'Portion size is small',
          'Taste is bland',
          'Too oily',
        ];
        const userId = sampleUserIds[Math.floor(Math.random() * sampleUserIds.length)] + '_comment_' + i;
        try {
          await prisma.comment.create({
            data: {
              text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
              menuItemId: item.id,
              userId: userId,
            },
          });
        } catch (e) {
          // Skip if error
        }
      }
    }
  }

  console.log(`✅ Sample feedback created (${feedbackCount} likes/dislikes)`);

  // Create sample food wastage data for last 7 days
  const wastageData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const cooked = Math.floor(Math.random() * 50) + 100; // 100-150 kg
    const wasted = Math.floor(Math.random() * 20) + 10; // 10-30 kg
    
    try {
      await prisma.foodWastage.upsert({
        where: { date: date },
        update: {},
        create: {
          date: date,
          cooked: cooked,
          wasted: wasted,
        },
      });
      wastageData.push({ date, cooked, wasted });
    } catch (e) {
      // Skip if duplicate
    }
  }

  console.log(`✅ Sample food wastage data created (${wastageData.length} days)`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



