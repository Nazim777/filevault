import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function formatDate(date: string | Date, short = false) {
  const d = new Date(date);
  if (short) return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function getFileIcon(fileType: string): string {
  switch (fileType) {
    case "IMAGE": return "🖼️";
    case "VIDEO": return "🎬";
    case "AUDIO": return "🎵";
    case "PDF":   return "📄";
    default:      return "📁";
  }
}

export function getFileColor(fileType: string): string {
  switch (fileType) {
    case "IMAGE": return "bg-purple-50 text-purple-600 border-purple-200";
    case "VIDEO": return "bg-blue-50 text-blue-600 border-blue-200";
    case "AUDIO": return "bg-green-50 text-green-600 border-green-200";
    case "PDF":   return "bg-red-50 text-red-600 border-red-200";
    default:      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export const TIER_COLORS: Record<string, string> = {
  FREE:    "bg-slate-100 text-slate-700 border-slate-200",
  SILVER:  "bg-gray-100 text-gray-700 border-gray-300",
  GOLD:    "bg-amber-50 text-amber-700 border-amber-200",
  DIAMOND: "bg-blue-50 text-blue-700 border-blue-200",
};

export const TIER_GRADIENTS: Record<string, string> = {
  FREE:    "from-slate-400 to-slate-500",
  SILVER:  "from-gray-400 to-gray-600",
  GOLD:    "from-amber-400 to-yellow-500",
  DIAMOND: "from-blue-400 to-indigo-500",
};
