import { create } from "zustand";
import { Folder, FileItem } from "@/types";
import api from "@/lib/api";

interface FileState {
  folders: Folder[];
  files: FileItem[];
  currentFolder: Folder | null;
  breadcrumb: { id: string; name: string }[];
  isLoading: boolean;
  addFile: (file: FileItem) => void;
  fetchFolders: (parentId?: string | null) => Promise<void>;
  fetchFolder: (id: string) => Promise<void>;
  fetchBreadcrumb: (folderId: string) => Promise<void>;
  createFolder: (name: string, parentId?: string | null) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  renameFile: (id: string, name: string) => Promise<void>;
  reset: () => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  folders: [],
  files: [],
  currentFolder: null,
  breadcrumb: [],
  isLoading: false,

  fetchFolders: async (parentId = null) => {
    set({ isLoading: true });
    try {
      const params = parentId ? { parentId } : { parentId: "null" };
      const { data } = await api.get("/folders", { params });
      set({ folders: data, files: [], currentFolder: null });
    } finally {
      set({ isLoading: false });
    }
  },

  addFile: (file) =>
    set((state) => {
      // only add if user is inside the same folder
      if (!state.currentFolder) return state;

      if (file.folderId !== state.currentFolder.id) {
        return state; // ignore if not current folder
      }

      return {
        files: [file, ...state.files],
      };
    }),

  fetchFolder: async (id) => {
    set({ isLoading: true });
    try {
      const [folder, crumbs] = await Promise.all([
        api.get(`/folders/${id}`),
        api.get(`/folders/${id}/breadcrumb`),
      ]);
      set({
        currentFolder: folder.data,
        folders: folder.data.children || [],
        files: folder.data.files || [],
        breadcrumb: crumbs.data,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchBreadcrumb: async (folderId) => {
    const { data } = await api.get(`/folders/${folderId}/breadcrumb`);
    set({ breadcrumb: data });
  },

  createFolder: async (name, parentId = null) => {
    await api.post("/folders", { name, parentId });
    const cur = get().currentFolder;
    if (cur) await get().fetchFolder(cur.id);
    else await get().fetchFolders(null);
  },

  renameFolder: async (id, name) => {
    await api.patch(`/folders/${id}`, { name });
    const cur = get().currentFolder;
    if (cur) await get().fetchFolder(cur.id);
    else await get().fetchFolders(null);
  },

  deleteFolder: async (id) => {
    await api.delete(`/folders/${id}`);
    const cur = get().currentFolder;
    if (cur) await get().fetchFolder(cur.id);
    else await get().fetchFolders(null);
  },

  deleteFile: async (id) => {
    await api.delete(`/files/${id}`);
    set((s) => ({ files: s.files.filter((f) => f.id !== id) }));
  },

  renameFile: async (id, name) => {
    const { data } = await api.patch(`/files/${id}`, { name });
    set((s) => ({ files: s.files.map((f) => (f.id === id ? data : f)) }));
  },

  reset: () =>
    set({ folders: [], files: [], currentFolder: null, breadcrumb: [] }),
}));
