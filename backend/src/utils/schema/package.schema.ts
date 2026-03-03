import { z } from "zod";
import { FileType, PackageTier } from "@prisma/client";

 export const packageSchema = z.object({
  name: z.string().min(1),
  tier: z.nativeEnum(PackageTier),
  maxFolders: z.number().int().positive(),
  maxNestingLevel: z.number().int().positive(),
  allowedFileTypes: z.array(z.nativeEnum(FileType)).min(1),
  maxFileSizeMB: z.number().positive(),
  totalFileLimit: z.number().int().positive(),
  filesPerFolder: z.number().int().positive(),
});