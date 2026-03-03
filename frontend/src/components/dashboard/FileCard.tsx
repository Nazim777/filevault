"use client";
import { useState } from "react";
import { FileItem } from "@/types";
import { useFileStore } from "@/store/fileStore";
import { toast } from "@/hooks/use-toast";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  Eye,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatBytes, getFileColor } from "@/lib/utils";

const FileTypeIcon = ({
  type,
  className = "",
}: {
  type: string;
  className?: string;
}) => {
  const props = { className: `${className}` };
  switch (type) {
    case "IMAGE":
      return <FileImage {...props} />;
    case "VIDEO":
      return <FileVideo {...props} />;
    case "AUDIO":
      return <FileAudio {...props} />;
    default:
      return <FileText {...props} />;
  }
};

export function FileCard({ file }: { file: FileItem }) {
  const { deleteFile, renameFile } = useFileStore();
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [loading, setLoading] = useState(false);


  


  const colorClass = getFileColor(file.fileType);

  const handleRename = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await renameFile(file.id, newName.trim());
      setRenaming(false);
      toast({ title: "File renamed" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteFile(file.id);
      toast({ title: "File deleted" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message,
      });
    } finally {
      setLoading(false);
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = file.cloudinaryUrl;
    a.download = file.name;
    a.target = "_blank";
    a.click();
  };

  return (
    <>
      <div className="group relative bg-white border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-150">
        {/* Thumbnail */}
        <div className="aspect-square relative overflow-hidden bg-muted/30">
          {file.fileType === "IMAGE" ? (
            <img
              src={file.cloudinaryUrl}
              alt={file.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${colorClass.replace("border-", "border ")} border`}
            >
              <FileTypeIcon
                type={file.fileType}
                className={`h-12 w-12 ${colorClass.split(" ")[1]}`}
              />
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => setPreview(true)}
              className="h-10 w-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <Eye className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatBytes(file.sizeBytes)}
          </p>
        </div>

        {/* Menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                setMenu(!menu);
              }}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
            {menu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenu(false)}
                />
                <div className="absolute right-0 top-8 bg-white border rounded-xl shadow-xl z-20 py-1.5 w-40 overflow-hidden">
                  <button
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-accent w-full text-left"
                    onClick={() => {
                      setPreview(true);
                      setMenu(false);
                    }}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    Preview
                  </button>
                  <button
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-accent w-full text-left"
                    onClick={() => {
                      handleDownload();
                      setMenu(false);
                    }}
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                    Download
                  </button>
                  <button
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-accent w-full text-left"
                    onClick={() => {
                      setRenaming(true);
                      setMenu(false);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    Rename
                  </button>
                  <div className="h-px bg-border mx-2 my-1" />
                  <button
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-destructive/5 text-destructive w-full text-left"
                    onClick={() => {
                      setDeleting(true);
                      setMenu(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rename */}
      <Dialog
        open={renaming}
        onOpenChange={(o) => {
          if (!o) {
            setRenaming(false);
            setNewName(file.name);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenaming(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={loading || !newName.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleting} onOpenChange={setDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Permanently delete &quot;{file.name}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview */}
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileTypeIcon
                type={file.fileType}
                className="h-5 w-5 text-muted-foreground"
              />
              {file.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center bg-muted/30 rounded-xl overflow-hidden max-h-[70vh]">
            {file.fileType === "IMAGE" && (
              <img
                src={file.cloudinaryUrl}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
            {file.fileType === "VIDEO" && (
              <video
                src={file.cloudinaryUrl}
                controls
                className="max-w-full max-h-[70vh]"
              />
            )}
            {file.fileType === "AUDIO" && (
              <div className="p-12 flex flex-col items-center gap-4">
                <FileAudio className="h-16 w-16 text-green-500" />
                <audio
                  src={file.cloudinaryUrl}
                  controls
                  className="w-full max-w-sm"
                />
              </div>
            )}
            {file.fileType === "PDF" && (
              <iframe
                src={`${file.cloudinaryUrl}`}
                className="w-full h-[65vh] rounded"
                title={file.name}
              />
            )}
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">
              {formatBytes(file.sizeBytes)}
            </span>
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
