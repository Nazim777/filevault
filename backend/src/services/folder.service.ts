import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";
import { SubscriptionService } from "./subscription.service";

export class FolderService {
  private readonly subscriptionService: SubscriptionService;
  constructor(
    subscriptionService: SubscriptionService = new SubscriptionService(),
  ) {
    this.subscriptionService = subscriptionService;
  }

  async getFolders(userId: string, parentId: string | null) {
    return prisma.folder.findMany({
      where: { userId, parentId },
      include: { _count: { select: { children: true, files: true } } },
      orderBy: { name: "asc" },
    });
  }

  async getFolderById(id: string, userId: string) {
    const folder = await prisma.folder.findFirst({
      where: { id, userId },
      include: {
        children: {
          include: { _count: { select: { children: true, files: true } } },
        },
        files: { orderBy: { createdAt: "desc" } },
        parent: { select: { id: true, name: true } },
      },
    });
    if (!folder) throw new AppError("Folder not found", 404);
    return folder;
  }

  async getBreadcrumb(folderId: string, userId: string) {
    const crumbs: { id: string; name: string }[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      // @ts-ignore
      const folder = await prisma.folder.findFirst({
        where: { id: currentId, userId },
        select: { id: true, name: true, parentId: true },
      });
      if (!folder) break;
      crumbs.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parentId;
    }

    return crumbs;
  }

  async createFolder(userId: string, name: string, parentId: string | null) {
    const { nestLevel } = await this.subscriptionService.checkFolderLimits(
      userId,
      parentId,
    );

    const existing = await prisma.folder.findFirst({
      where: { name, userId, parentId },
    });
    if (existing)
      throw new AppError("A folder with this name already exists here", 409);

    return prisma.folder.create({
      data: { name, userId, parentId, nestLevel },
    });
  }

  async renameFolder(id: string, userId: string, name: string) {
    const folder = await prisma.folder.findFirst({ where: { id, userId } });
    if (!folder) throw new AppError("Folder not found", 404);

    const conflict = await prisma.folder.findFirst({
      where: { name, userId, parentId: folder.parentId, NOT: { id } },
    });
    if (conflict)
      throw new AppError("A folder with this name already exists here", 409);

    return prisma.folder.update({ where: { id }, data: { name } });
  }

  async deleteFolder(id: string, userId: string) {
    const folder = await prisma.folder.findFirst({ where: { id, userId } });
    if (!folder) throw new AppError("Folder not found", 404);

    await prisma.folder.delete({ where: { id } });
    return { message: "Folder deleted successfully" };
  }
}
