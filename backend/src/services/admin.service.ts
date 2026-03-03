import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";
import { PackageDto } from "../utils/Dto/package.dto";
import { packageSchema } from "../utils/schema/package.schema";

export class AdminService {
  async getDashboardStats() {
    const [totalUsers, totalFiles, totalFolders, packages] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.file.count(),
      prisma.folder.count(),
      prisma.subscriptionPackage.findMany({
        include: {
          _count: {
            select: { subscriptions: { where: { isActive: true } } },
          },
        },
      }),
    ]);

    return { totalUsers, totalFiles, totalFolders, packages };
  }

  async getAllUsers() {
    return prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        _count: { select: { files: true, folders: true } },
        subscriptions: {
          where: { isActive: true },
          include: { package: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createPackage(dto: PackageDto) {
    const body = packageSchema.parse(dto);
    return prisma.subscriptionPackage.create({ data: body });
  }

  async updatePackage(id: string, dto: Partial<PackageDto>) {
    const pkg = await prisma.subscriptionPackage.findUnique({ where: { id } });
    if (!pkg) throw new AppError("Package not found", 404);

    return prisma.subscriptionPackage.update({
      where: { id },
      data: packageSchema.partial().parse(dto),
    });
  }

  async deletePackage(id: string) {
    const pkg = await prisma.subscriptionPackage.findUnique({ where: { id } });
    if (!pkg) throw new AppError("Package not found", 404);

    await prisma.subscriptionPackage.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: "Package deactivated successfully" };
  }
}
