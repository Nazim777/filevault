import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@filevault.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@filevault.com',
      password: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });
  console.log(`  ✔ Admin: ${admin.email} / admin123`);

  const packages = [
    {
      name: 'Free',
      tier: 'FREE' as const,
      maxFolders: 5,
      maxNestingLevel: 2,
      allowedFileTypes: ['IMAGE', 'PDF'] as any[],
      maxFileSizeMB: 5,
      totalFileLimit: 20,
      filesPerFolder: 5,
    },
    {
      name: 'Silver',
      tier: 'SILVER' as const,
      maxFolders: 20,
      maxNestingLevel: 3,
      allowedFileTypes: ['IMAGE', 'VIDEO', 'PDF', 'AUDIO'] as any[],
      maxFileSizeMB: 25,
      totalFileLimit: 100,
      filesPerFolder: 20,
    },
    {
      name: 'Gold',
      tier: 'GOLD' as const,
      maxFolders: 100,
      maxNestingLevel: 5,
      allowedFileTypes: ['IMAGE', 'VIDEO', 'PDF', 'AUDIO'] as any[],
      maxFileSizeMB: 100,
      totalFileLimit: 500,
      filesPerFolder: 50,
    },
    {
      name: 'Diamond',
      tier: 'DIAMOND' as const,
      maxFolders: 1000,
      maxNestingLevel: 10,
      allowedFileTypes: ['IMAGE', 'VIDEO', 'PDF', 'AUDIO'] as any[],
      maxFileSizeMB: 500,
      totalFileLimit: 5000,
      filesPerFolder: 200,
    },
  ];

  for (const pkg of packages) {
    await prisma.subscriptionPackage.upsert({
      where: { tier: pkg.tier },
      update: {},
      create: pkg,
    });
    console.log(`  ✔ Package: ${pkg.name}`);
  }

  console.log('✅ Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
