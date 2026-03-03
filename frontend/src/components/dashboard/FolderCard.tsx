"use client";
import { useState } from "react";
import { Folder } from "@/types";
import { useFileStore } from "@/store/fileStore";
import { toast } from "@/hooks/use-toast";
import { MoreVertical, Pencil, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface Props {
  folder: Folder;
  onOpen: (id: string, name: string) => void;
}

export function FolderCard({ folder, onOpen }: Props) {
  const { renameFolder, deleteFolder } = useFileStore();
  const [menu, setMenu] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await renameFolder(folder.id, newName.trim());
      setRenaming(false);
      toast({ title: "Folder renamed" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message });
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteFolder(folder.id);
      setDeleting(false);
      toast({ title: "Folder deleted" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message });
    } finally { setLoading(false); }
  };

  return (
    <>
      <div
        className="group relative bg-white border rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-150 select-none"
        onDoubleClick={() => onOpen(folder.id, folder.name)}
      >
        {/* Folder icon */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="relative">
            <div className="h-14 w-14 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderOpen className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <div className="w-full text-center">
            <p className="text-sm font-medium truncate px-1">{folder.name}</p>
            {folder._count && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {folder._count.children > 0 && `${folder._count.children} folder${folder._count.children !== 1 ? "s" : ""}`}
                {folder._count.children > 0 && folder._count.files > 0 && " · "}
                {folder._count.files > 0 && `${folder._count.files} file${folder._count.files !== 1 ? "s" : ""}`}
                {folder._count.children === 0 && folder._count.files === 0 && "Empty"}
              </p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <Button
              variant="ghost" size="icon-sm"
              className="h-6 w-6 bg-white/80 hover:bg-white shadow-sm"
              onClick={(e) => { e.stopPropagation(); setMenu(!menu); }}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute right-0 top-7 bg-white border rounded-xl shadow-xl z-20 py-1.5 w-40 overflow-hidden">
                  <button className="flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-accent w-full text-left transition-colors"
                    onClick={() => { onOpen(folder.id, folder.name); setMenu(false); }}>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />Open
                  </button>
                  <button className="flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-accent w-full text-left transition-colors"
                    onClick={() => { setRenaming(true); setMenu(false); }}>
                    <Pencil className="h-4 w-4 text-muted-foreground" />Rename
                  </button>
                  <div className="h-px bg-border mx-2 my-1" />
                  <button className="flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-destructive/5 text-destructive w-full text-left transition-colors"
                    onClick={() => { setDeleting(true); setMenu(false); }}>
                    <Trash2 className="h-4 w-4" />Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renaming} onOpenChange={(o) => { if (!o) { setRenaming(false); setNewName(folder.name); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Folder</DialogTitle></DialogHeader>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRename()} autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenaming(false)}>Cancel</Button>
            <Button onClick={handleRename} disabled={loading || !newName.trim()}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleting} onOpenChange={setDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>This will permanently delete &quot;{folder.name}&quot; and everything inside it. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting…" : "Delete Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
