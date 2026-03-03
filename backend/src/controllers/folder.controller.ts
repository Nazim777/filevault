import { Response } from "express";
import { FolderService } from "../services/folder.service";
import { AuthenticatedRequest } from "../types";

export class FolderController {
  private readonly folderService: FolderService;
  constructor(folderService: FolderService = new FolderService()) {
    this.folderService = folderService;
  }

  getFolders = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const parentId =
      req.query.parentId === "null" || !req.query.parentId
        ? null
        : (req.query.parentId as string);

    const folders = await this.folderService.getFolders(req.user.id, parentId);
    res.json(folders);
  };

  getFolderById = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const folder = await this.folderService.getFolderById(
      req.params.id,
      req.user.id,
    );
    res.json(folder);
  };

  getBreadcrumb = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const crumbs = await this.folderService.getBreadcrumb(
      req.params.id,
      req.user.id,
    );
    res.json(crumbs);
  };

  createFolder = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const { name, parentId } = req.body;
    const folder = await this.folderService.createFolder(
      req.user.id,
      name,
      parentId ?? null,
    );
    res.status(201).json(folder);
  };

  renameFolder = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const folder = await this.folderService.renameFolder(
      req.params.id,
      req.user.id,
      req.body.name,
    );
    res.json(folder);
  };

  deleteFolder = async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const result = await this.folderService.deleteFolder(
      req.params.id,
      req.user.id,
    );
    res.json(result);
  };
}
