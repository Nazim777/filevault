import { Response } from "express";
import { FileService } from "../services/file.service";
import { AuthenticatedRequest } from "../types";

export class FileController {
  private readonly fileService: FileService;
  constructor(fileService: FileService = new FileService()) {
    this.fileService = fileService;
  }

  uploadFile = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    await this.fileService.uploadFile(req, res);
  };

  getFilesInFolder = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const files = await this.fileService.getFilesInFolder(
      req.params.folderId,
      req.user.id,
    );
    res.json(files);
  };

  getAllUserFiles = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const files = await this.fileService.getAllUserFiles(req.user.id);
    res.json(files);
  };

  getFileById = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const file = await this.fileService.getFileById(req.params.id, req.user.id);
    res.json(file);
  };

  renameFile = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const file = await this.fileService.renameFile(
      req.params.id,
      req.user.id,
      req.body.name,
    );
    res.json(file);
  };

  deleteFile = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const result = await this.fileService.deleteFile(
      req.params.id,
      req.user.id,
    );
    res.json(result);
  };
}
