"use client";
import { useEffect, useState } from "react";
import { useFileStore } from "@/store/fileStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderCard } from "@/components/dashboard/FolderCard";
import { FileCard } from "@/components/dashboard/FileCard";
import { CreateFolderDialog } from "@/components/dashboard/CreateFolderDialog";
import { UploadFileDialog } from "@/components/dashboard/UploadFileDialog";
import { FolderPlus, Upload, Home, ChevronRight, AlertTriangle, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { UserSubscription } from "@/types";
import Link from "next/link";

export default function DashboardPage() {
  const { folders, files, currentFolder, isLoading, fetchFolders, fetchFolder, reset } = useFileStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [activeSub, setActiveSub] = useState<UserSubscription | null | undefined>(undefined);
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchFolders(null);
    api.get("/subscriptions/active").then((r) => setActiveSub(r.data)).catch(() => setActiveSub(null));
  }, []);

  const openFolder = async (id: string, name: string) => {
    setFolderStack((p) => [...p, { id, name }]);
    await fetchFolder(id);
  };

  const navigateTo = async (index: number) => {
    if (index === -1) {
      setFolderStack([]);
      reset();
      fetchFolders(null);
      return;
    }
    const target = folderStack[index];
    setFolderStack(folderStack.slice(0, index + 1));
    await fetchFolder(target.id);
  };

  const onCreated = () => {
    if (currentFolder) fetchFolder(currentFolder.id);
    else fetchFolders(null);
  };

  const hasNoPlan = activeSub === null;
  const planName = activeSub?.package.name;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Files</h1>
          <div className="flex items-center gap-2 mt-1">
            {activeSub === undefined ? (
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            ) : hasNoPlan ? (
              <span className="flex items-center gap-1.5 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                No active plan.{" "}
                <Link href="/dashboard/packages" className="underline font-medium">Select one</Link>
              </span>
            ) : (
              <Badge variant="info" className="text-xs">{planName} Plan</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
            <FolderPlus className="h-4 w-4 mr-1.5" />New Folder
          </Button>
          <Button size="sm" onClick={() => setShowUpload(true)} disabled={!currentFolder}>
            <Upload className="h-4 w-4 mr-1.5" />Upload
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm mb-5 flex-wrap">
        <button onClick={() => navigateTo(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent">
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </button>
        {folderStack.map((f, i) => (
          <span key={f.id} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            <button
              onClick={() => navigateTo(i)}
              className={`px-2 py-1 rounded-md transition-colors ${i === folderStack.length - 1
                ? "text-foreground font-medium bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
            >
              {f.name}
            </button>
          </span>
        ))}
      </nav>

      {isLoading ? (
        <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
      ) : (
        <>
          {/* Folders */}
          {folders.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Folders ({folders.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {folders.map((f) => <FolderCard key={f.id} folder={f} onOpen={openFolder} />)}
              </div>
            </section>
          )}

          {/* Files */}
          {files.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Files ({files.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {files.map((f) => <FileCard key={f.id} file={f} />)}
              </div>
            </section>
          )}

          {/* Empty state */}
          {folders.length === 0 && files.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FolderPlus className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {currentFolder ? "This folder is empty" : "No folders yet"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {currentFolder
                  ? "Upload files or create sub-folders to organize your content."
                  : "Create your first folder to start organizing your files."}
              </p>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreate(true)}>
                  <FolderPlus className="h-4 w-4 mr-1.5" />New Folder
                </Button>
                {currentFolder && (
                  <Button onClick={() => setShowUpload(true)}>
                    <Upload className="h-4 w-4 mr-1.5" />Upload File
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <CreateFolderDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        parentId={currentFolder?.id ?? null}
        onCreated={onCreated}
      />
      <UploadFileDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        folderId={currentFolder?.id ?? ""}
        onUploaded={onCreated}
      />
    </div>
  );
}
