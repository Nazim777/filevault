import { z } from "zod";
import { packageSchema } from "../schema/package.schema";
export type PackageDto = z.infer<typeof packageSchema>;