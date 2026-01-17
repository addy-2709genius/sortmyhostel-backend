import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'sortmyhostel@aaditya.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'sorted@123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword, // Update password in case it changed
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create HR/Interviewer admin account
  const hrEmail = 'aadityaraj.soni@adypu.edu.in';
  const hrPassword = 'aaditya@123';
  const hashedHrPassword = await bcrypt.hash(hrPassword, 10);

  const hrAdmin = await prisma.admin.upsert({
    where: { email: hrEmail },
    update: {
      password: hashedHrPassword, // Update password in case it changed
    },
    create: {
      email: hrEmail,
      password: hashedHrPassword,
    },
  });

  console.log('✅ HR/Interviewer admin user created:', hrAdmin.email);
  console.log('📝 Note: Menu items, feedback, and wastage data should be added through admin dashboard');
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
