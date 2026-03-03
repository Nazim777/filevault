"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { formatBytes } from "@/lib/utils";
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cloud,
  FileUp,
} from "lucide-react";
import { useFileStore } from "@/store/fileStore";

interface Props {
  open: boolean;
  onClose: () => void;
  folderId: string;
  onUploaded: () => void;
}

type FileStatus = "pending" | "uploading" | "done" | "error";

interface FileEntry {
  file: File;
  status: FileStatus;
  percent: number;
  phase: string;
  errorMsg?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function uploadWithProgress(
  file: File,
  folderId: string,
  onProgress: (phase: string, percent: number) => void,
  onDone: (fileRecord: object) => void,
  onError: (msg: string) => void,
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const formData = new FormData();
  // folderId MUST come before file (busboy parses fields sequentially)
  formData.append("folderId", folderId);
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/files/upload`, {
      method: "POST",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
  } catch {
    onError("Network error — check your connection");
    return;
  }

  if (!response.ok || !response.body) {
    onError(`Server error: ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6).trim());
          if (currentEvent === "progress") {
            onProgress(data.phase ?? "uploading", data.percent ?? 0);
          } else if (currentEvent === "done") {
            onDone(data.file);
          } else if (currentEvent === "error") {
            onError(data.message ?? "Upload failed");
          }
        } catch {
          /* ignore */
        }
        currentEvent = "";
      }
    }
  }
}

export function UploadFileDialog({
  open,
  onClose,
  folderId,
  // onUploaded,
}: Props) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const addFile = useFileStore((s) => s.addFile);
  const update = (idx: number, patch: Partial<FileEntry>) =>
    setEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)),
    );

  const onDrop = useCallback((accepted: File[]) => {
    setEntries((prev) => [
      ...prev,
      ...accepted.map((file) => ({
        file,
        status: "pending" as const,
        percent: 0,
        phase: "",
      })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    setUploading(true);
    let anyError = false;

    for (let i = 0; i < entries.length; i++) {
      if (entries[i].status === "done") continue;
      update(i, { status: "uploading", percent: 0, phase: "uploading" });

      await uploadWithProgress(
        entries[i].file,
        folderId,
        (phase, percent) => update(i, { status: "uploading", phase, percent }),

        (fileRecord: any) => {
          const file = fileRecord.file || fileRecord;

          console.log("UPLOADED FILE:", file);

          update(i, { status: "done", percent: 100 });

          setTimeout(() => {
            addFile(file);
          }, 200);
        },

        (msg) => {
          update(i, { status: "error", errorMsg: msg });
          anyError = true;
        },
      );
    }
    

    if (!anyError) {
      toast({ title: "Upload complete!" });
       setUploading(false);
    } else {
      toast({ variant: "destructive", title: "Some files failed to upload" });
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setEntries([]);
    onClose();
  };

  const pendingCount = entries.filter((e) => e.status !== "done").length;
  const totalSize = entries.reduce((acc, e) => acc + e.file.size, 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Cloud className="h-4 w-4 text-blue-600" />
            </div>
            <DialogTitle>Upload Files</DialogTitle>
          </div>
        </DialogHeader>

        {/* Drop zone */}
        {!uploading && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 select-none ${
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/30"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${isDragActive ? "bg-primary/10" : "bg-muted"}`}
              >
                <FileUp
                  className={`h-6 w-6 ${isDragActive ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? "Drop files here" : "Drag & drop files"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse · Images, Videos, Audio, PDF
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File list */}
        {entries.length > 0 && (
          <div className="space-y-2 max-h-72 overflow-y-auto -mx-1 px-1">
            {entries.map((entry, i) => (
              <div
                key={i}
                className={`rounded-xl border p-3 transition-colors ${
                  entry.status === "done"
                    ? "border-emerald-200 bg-emerald-50/50"
                    : entry.status === "error"
                      ? "border-red-200 bg-red-50/50"
                      : entry.status === "uploading"
                        ? "border-blue-200 bg-blue-50/50"
                        : "border-border bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* Status icon */}
                  <div className="shrink-0">
                    {entry.status === "done" && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                    {entry.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {entry.status === "uploading" && (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    {entry.status === "pending" && (
                      <Upload className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {entry.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(entry.file.size)}
                    </p>
                  </div>
                  {!uploading && entry.status !== "done" && (
                    <button
                      onClick={() =>
                        setEntries((e) => e.filter((_, j) => j !== i))
                      }
                      className="shrink-0 p-0.5 rounded hover:bg-muted/60"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                {entry.status === "uploading" && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${entry.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-blue-600/80">
                      <span>Uploading to cloud…</span>
                      <span className="font-medium">{entry.percent}%</span>
                    </div>
                  </div>
                )}

                {entry.status === "done" && (
                  <p className="text-xs text-emerald-600 font-medium">
                    Uploaded successfully ✓
                  </p>
                )}
                {entry.status === "error" && (
                  <p className="text-xs text-red-600">{entry.errorMsg}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary bar */}
        {entries.length > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              {entries.length} files selected · {formatBytes(totalSize)} total
            </span>
            <span>
              {entries.filter((e) => e.status === "done").length} done
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={entries.length === 0 || uploading || pendingCount === 0}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {pendingCount} file{pendingCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
