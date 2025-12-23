import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearSampleData() {
  console.log('🧹 Clearing all sample data...');

  try {
    // Delete all menu items
    const deletedMenuItems = await prisma.menuItem.deleteMany({});
    console.log(`✅ Deleted ${deletedMenuItems.count} menu items`);

    // Delete all feedback
    const deletedFeedback = await prisma.feedback.deleteMany({});
    console.log(`✅ Deleted ${deletedFeedback.count} feedback entries`);

    // Delete all comments
    const deletedComments = await prisma.comment.deleteMany({});
    console.log(`✅ Deleted ${deletedComments.count} comments`);

    // Delete all food wastage data
    const deletedWastage = await prisma.foodWastage.deleteMany({});
    console.log(`✅ Deleted ${deletedWastage.count} wastage entries`);

    // Note: We keep admin and student users
    console.log('✅ Sample data cleared!');
    console.log('📝 Admin and student accounts are preserved');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

clearSampleData()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

