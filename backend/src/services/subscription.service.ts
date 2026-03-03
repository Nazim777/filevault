import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";
import { FileType, SubscriptionPackage } from "@prisma/client";

export class SubscriptionService {
  async getActivePackage(userId: string): Promise<SubscriptionPackage> {
    const sub = await prisma.userSubscription.findFirst({
      where: { userId, isActive: true },
      include: { package: true },
      orderBy: { createdAt: "desc" },
    });
    if (!sub) {
      throw new AppError(
        "No active subscription found. Please select a package to continue.",
        403,
      );
    }
    return sub.package;
  }

  async checkFolderLimits(
    userId: string,
    parentId: string | null,
  ): Promise<{ nestLevel: number }> {
    const pkg = await this.getActivePackage(userId);

    const totalFolders = await prisma.folder.count({ where: { userId } });
    if (totalFolders >= pkg.maxFolders) {
      throw new AppError(
        `Your ${pkg.name} plan allows a maximum of ${pkg.maxFolders} folders.`,
        403,
      );
    }

    if (parentId) {
      const parent = await prisma.folder.findUnique({
        where: { id: parentId },
      });
      if (!parent) throw new AppError("Parent folder not found", 404);
      const newLevel = parent.nestLevel + 1;
      if (newLevel >= pkg.maxNestingLevel) {
        throw new AppError(
          `Your ${pkg.name} plan allows a maximum nesting depth of ${pkg.maxNestingLevel}.`,
          403,
        );
      }
      return { nestLevel: newLevel };
    }

    return { nestLevel: 0 };
  }

  async checkFileLimits(
    userId: string,
    folderId: string,
    fileType: FileType,
    fileSizeBytes: number,
  ): Promise<void> {
    const pkg = await this.getActivePackage(userId);

    if (!pkg.allowedFileTypes.includes(fileType)) {
      throw new AppError(
        `Your ${pkg.name} plan does not allow ${fileType} uploads.`,
        403,
      );
    }

    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    if (fileSizeMB > pkg.maxFileSizeMB) {
      throw new AppError(
        `File size exceeds the ${pkg.maxFileSizeMB}MB limit on your ${pkg.name} plan.`,
        403,
      );
    }

    const [totalFiles, folderFiles] = await Promise.all([
      prisma.file.count({ where: { userId } }),
      prisma.file.count({ where: { folderId } }),
    ]);

    if (totalFiles >= pkg.totalFileLimit) {
      throw new AppError(
        `Your ${pkg.name} plan allows a maximum of ${pkg.totalFileLimit} total files.`,
        403,
      );
    }

    if (folderFiles >= pkg.filesPerFolder) {
      throw new AppError(
        `This folder has reached the maximum of ${pkg.filesPerFolder} files on your ${pkg.name} plan.`,
        403,
      );
    }
  }

  async selectPackage(userId: string, packageId: string) {
    const pkg = await prisma.subscriptionPackage.findUnique({
      where: { id: packageId },
    });
    if (!pkg || !pkg.isActive)
      throw new AppError("Package not found or inactive", 404);

    await prisma.userSubscription.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, endDate: new Date() },
    });

    const sub = await prisma.userSubscription.create({
      data: { userId, packageId, isActive: true },
      include: { package: true },
    });

    return sub;
  }

  async getUserHistory(userId: string) {
    return prisma.userSubscription.findMany({
      where: { userId },
      include: { package: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getUserActiveSub(userId: string) {
    return prisma.userSubscription.findFirst({
      where: { userId, isActive: true },
      include: { package: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllPackages() {
    return prisma.subscriptionPackage.findMany({
      where: { isActive: true },
      orderBy: { tier: "asc" },
    });
  }
}
