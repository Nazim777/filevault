"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFileStore } from "@/store/fileStore";
import { toast } from "@/hooks/use-toast";
import { FolderPlus } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
  onCreated: () => void;
}

export function CreateFolderDialog({ open, onClose, parentId, onCreated }: Props) {
  const { createFolder } = useFileStore();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createFolder(name.trim(), parentId);
      setName("");
      onClose();
      onCreated();
      toast({ title: "Folder created" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Failed to create folder" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setName(""); } }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <FolderPlus className="h-4 w-4 text-amber-500" />
            </div>
            <DialogTitle>New Folder</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>Folder name</Label>
          <Input
            placeholder="My Folder"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? "Creating…" : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
