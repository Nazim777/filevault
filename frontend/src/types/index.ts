export type Role = 'ADMIN' | 'USER';
export type FileType = 'IMAGE' | 'VIDEO' | 'PDF' | 'AUDIO';
export type PackageTier = 'FREE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  createdAt?: string;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  tier: PackageTier;
  maxFolders: number;
  maxNestingLevel: number;
  allowedFileTypes: FileType[];
  maxFileSizeMB: number;
  totalFileLimit: number;
  filesPerFolder: number;
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  packageId: string;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  package: SubscriptionPackage;
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  parentId: string | null;
  nestLevel: number;
  createdAt: string;
  updatedAt: string;
  _count?: { children: number; files: number };
  children?: Folder[];
  files?: FileItem[];
  parent?: { id: string; name: string } | null;
}

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  userId: string;
  folderId: string;
  fileType: FileType;
  mimeType: string;
  sizeBytes: number;
  cloudinaryId: string;
  cloudinaryUrl: string;
  createdAt: string;
  updatedAt: string;
  folder?: { id: string; name: string };
  previewUrl?:string
}
