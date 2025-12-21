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

  // Sample menu items (optional - you can remove this if you'll upload via Excel)
  const sampleMenuItems = [
    // Monday
    { name: 'Poha', day: 'monday', meal: 'breakfast' },
    { name: 'Tea / Coffee', day: 'monday', meal: 'breakfast' },
    { name: 'Dal Tadka', day: 'monday', meal: 'lunch' },
    { name: 'Jeera Rice', day: 'monday', meal: 'lunch' },
    { name: 'Samosa', day: 'monday', meal: 'snacks' },
    { name: 'Fried Rice', day: 'monday', meal: 'dinner' },
  ];

  for (const item of sampleMenuItems) {
    await prisma.menuItem.upsert({
      where: {
        id: `${item.day}-${item.meal}-${item.name}`.toLowerCase().replace(/\s+/g, '-'),
      },
      update: {},
      create: item,
    });
  }

  console.log('✅ Sample menu items created');
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


