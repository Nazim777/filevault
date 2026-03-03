import { Response } from "express";
import busboy from "busboy";
import { FileType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";
import { cloudinary, streamToCloudinary } from "../lib/cloudinary";
import { SubscriptionService } from "./subscription.service";
import { AuthenticatedRequest } from "../types";

export class FileService {
  private readonly subscriptionService: SubscriptionService;
  constructor(
    subscriptionService: SubscriptionService = new SubscriptionService(),
  ) {
    this.subscriptionService = subscriptionService;
  }

  private mimeToFileType(mime: string): FileType {
    if (mime.startsWith("image/")) return "IMAGE";
    if (mime.startsWith("video/")) return "VIDEO";
    if (mime.startsWith("audio/")) return "AUDIO";
    if (mime === "application/pdf") return "PDF";
    throw new AppError(
      "Unsupported file type. Allowed: image, video, audio, PDF.",
      400,
    );
  }

  /**
   * SSE streaming upload.
   * True pipe: Client → busboy → Cloudinary (no memory buffer).
   * folderId MUST be the first field in the multipart body.
   */
  async uploadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user.id;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders?.();
    const send = (event: string, data: object) => {
      try {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch {
        /* disconnected */
      }
    };

    const sendError = (msg: string) => {
      send("error", { message: msg });
      res.end();
    };

    const contentLength =
      parseInt(req.headers["content-length"] ?? "0", 10) || null;

    try {
      const bb = busboy({
        headers: req.headers,
        limits: { fileSize: 20 * 1024 * 1024 },
      });
      const fields: Record<string, string> = {};

      bb.on("field", (name, val) => {
        fields[name] = val;
      });

      await new Promise<void>((resolve, reject) => {
        bb.on("file", async (_field, fileStream, info) => {
          const { filename, mimeType } = info;
          const folderId = fields["folderId"];

          if (!folderId) {
            fileStream.resume();
            return reject(new AppError("folderId is required", 400));
          }

          const folder = await prisma.folder.findFirst({
            where: { id: folderId, userId },
          });
          if (!folder) {
            fileStream.resume();
            return reject(new AppError("Folder not found", 404));
          }

          let fileType: FileType;
          try {
            fileType = this.mimeToFileType(mimeType);
          } catch (err) {
            fileStream.resume();
            return reject(err);
          }

          try {
            await this.subscriptionService.checkFileLimits(
              userId,
              folderId,
              fileType,
              contentLength ?? 0,
            );
          } catch (err) {
            fileStream.resume();
            return reject(err);
          }

          const publicId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          let exactSize = 0;

          try {
            const result = await streamToCloudinary(
              fileStream,
              contentLength,
              {
                folder: "filevault",
                resource_type: fileType === "PDF" ? "raw" : "auto",
                public_id: publicId,
              },
              (progress) => {
                exactSize = progress.loaded;
                send("progress", {
                  phase: "uploading",
                  loaded: progress.loaded,
                  total: progress.total,
                  percent:
                    progress.percent ??
                    Math.min(
                      99,
                      Math.round(
                        (progress.loaded / (contentLength || progress.loaded)) *
                          100,
                      ),
                    ),
                });
              },
            );

            exactSize = result.bytes ?? exactSize;

            const file = await prisma.file.create({
              data: {
                name: filename,
                originalName: filename,
                userId,
                folderId,
                fileType,
                mimeType,
                sizeBytes: exactSize,
                cloudinaryId: result.public_id,
                cloudinaryUrl: result.secure_url,
              },
            });

            send("done", { file });
            res.end();
            resolve();
          } catch (err: any) {
            reject(
              new AppError(err?.message || "Upload to Cloudinary failed", 500),
            );
          }
        });

        bb.on("error", reject);
        // bb.on('finish', resolve);
        req.pipe(bb);
      });

      res.end();
    } catch (err: any) {
      console.error("[FileService.uploadFile]", err);
      sendError(err.message || "Upload failed");
    }
  }

  async getFilesInFolder(folderId: string, userId: string) {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId },
    });
    if (!folder) throw new AppError("Folder not found", 404);

    return prisma.file.findMany({
      where: { folderId, userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllUserFiles(userId: string) {
    return prisma.file.findMany({
      where: { userId },
      include: { folder: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getFileById(id: string, userId: string) {
    const file = await prisma.file.findFirst({ where: { id, userId } });
    if (!file) throw new AppError("File not found", 404);
    return file;
  }

  async renameFile(id: string, userId: string, name: string) {
    const file = await prisma.file.findFirst({ where: { id, userId } });
    if (!file) throw new AppError("File not found", 404);
    return prisma.file.update({ where: { id }, data: { name } });
  }

  async deleteFile(id: string, userId: string) {
    const file = await prisma.file.findFirst({ where: { id, userId } });
    if (!file) throw new AppError("File not found", 404);

    const resourceType =
      file.fileType === "IMAGE"
        ? "image"
        : file.fileType === "VIDEO"
          ? "video"
          : "raw";

    await cloudinary.uploader
      .destroy(file.cloudinaryId, { resource_type: resourceType })
      .catch(console.error);

    await prisma.file.delete({ where: { id } });
    return { message: "File deleted successfully" };
  }
}
