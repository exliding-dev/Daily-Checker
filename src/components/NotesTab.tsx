import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdClose,
  MdCheck,
  MdNote,
  MdAccessTime,
  MdCloudDone,
  MdCloudOff,
} from "react-icons/md";
import {
  saveNote as apiSaveNote,
  getNotes as apiGetNotes,
  updateNote as apiUpdateNote,
  deleteNote as apiDeleteNote,
  isUserRegistered,
} from "../lib/api";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  source?: "server" | "local";
}

const STORAGE_KEY = "maag_notes";

function loadLocalNotes(): Note[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotesTab() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "local" | "loading">("loading");

  // Load notes from server and local
  useEffect(() => {
    async function loadNotes() {
      setIsLoading(true);
      const localNotes = loadLocalNotes();

      if (isUserRegistered()) {
        try {
          const response = await apiGetNotes(1, 100);
          if (response.success && response.data) {
            // Map server data to Note format
            const serverNotes: Note[] = response.data.map((item: any) => ({
              id: item.uuid,
              title: item.title,
              content: item.content,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              source: "server" as const,
            }));

            // Merge: prefer server data, keep local-only items
            const serverIds = new Set(serverNotes.map((n) => n.id));
            const localOnly = localNotes.filter((n) => !serverIds.has(n.id));
            const merged = [...serverNotes, ...localOnly].sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );

            setNotes(merged);
            setSyncStatus("synced");
          } else {
            // Server unavailable — use local
            setNotes(localNotes);
            setSyncStatus("local");
          }
        } catch {
          setNotes(localNotes);
          setSyncStatus("local");
        }
      } else {
        setNotes(localNotes);
        setSyncStatus("local");
      }

      setIsLoading(false);
    }

    loadNotes();
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    const now = new Date().toISOString();

    if (editingNote) {
      // Update existing note
      const updatedNote = {
        ...editingNote,
        title: title.trim() || "Tanpa judul",
        content: content.trim(),
        updatedAt: now,
      };

      const updated = notes.map((n) =>
        n.id === editingNote.id ? updatedNote : n
      );
      setNotes(updated);
      saveLocalNotes(updated);

      // Sync to server
      if (isUserRegistered()) {
        try {
          await apiUpdateNote(editingNote.id, {
            title: updatedNote.title,
            content: updatedNote.content,
          });
        } catch (e) {
          console.error("[MAAG API] Failed to update note on server:", e);
        }
      }
    } else {
      // Create new note
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: title.trim() || "Tanpa judul",
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
        source: "local",
      };

      // Save to server first (to get server UUID)
      if (isUserRegistered()) {
        try {
          const response = await apiSaveNote({
            title: newNote.title,
            content: newNote.content,
          });
          if (response.success && response.data) {
            newNote.id = response.data.uuid;
            newNote.source = "server";
          }
        } catch (e) {
          console.error("[MAAG API] Failed to save note to server:", e);
        }
      }

      const updated = [newNote, ...notes];
      setNotes(updated);
      saveLocalNotes(updated);
    }

    setIsSaving(false);
    resetEditor();
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveLocalNotes(updated);

    // Delete from server
    if (isUserRegistered()) {
      try {
        await apiDeleteNote(id);
      } catch (e) {
        console.error("[MAAG API] Failed to delete note from server:", e);
      }
    }

    setDeleteConfirm(null);
  };

  const resetEditor = () => {
    setShowEditor(false);
    setEditingNote(null);
    setTitle("");
    setContent("");
  };

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="flex flex-col items-center pt-16">
        <motion.div
          className="w-8 h-8 border-3 border-[#d4e8d0] border-t-[#3d6b35] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-sm text-[#6a8f62] mt-3">Memuat catatan...</p>
      </div>
    );
  }

  // ─── Editor View ───
  if (showEditor) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="space-y-4"
      >
        {/* Editor header */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={resetEditor}
            className="flex items-center gap-1.5 text-sm text-[#6a8f62] font-medium"
            whileTap={{ scale: 0.95 }}
          >
            <MdClose className="w-5 h-5" />
            Batal
          </motion.button>
          <h3 className="font-bold text-[#2d4a28] text-base">
            {editingNote ? "Edit Catatan" : "Catatan Baru"}
          </h3>
          <motion.button
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className={`flex items-center gap-1.5 text-sm font-semibold ${
              content.trim() && !isSaving ? "text-[#3d6b35]" : "text-[#a8cfa0]"
            }`}
            whileTap={content.trim() ? { scale: 0.95 } : undefined}
          >
            {isSaving ? (
              <motion.div
                className="w-4 h-4 border-2 border-[#d4e8d0] border-t-[#3d6b35] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <MdCheck className="w-5 h-5" />
            )}
            Simpan
          </motion.button>
        </div>

        {/* Title input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul catatan (opsional)"
            className="welcome-input text-base font-semibold"
            id="input-note-title"
          />
        </div>

        {/* Content textarea */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis catatanmu di sini... Misalnya: makanan yang dimakan hari ini, gejala yang dirasakan, atau hal lain yang ingin diingat."
            className="welcome-input min-h-[200px] text-sm leading-relaxed resize-none"
            id="input-note-content"
            autoFocus
            style={{ paddingTop: "14px" }}
          />
        </div>

        {/* Quick suggestions */}
        <div className="space-y-2">
          <p className="text-xs text-[#6a8f62] font-medium">Ide catatan:</p>
          <div className="flex flex-wrap gap-2">
            {["🍽️ Makanan hari ini", "💊 Obat yang diminum", "😣 Gejala yang muncul", "🏃 Aktivitas hari ini"].map(
              (suggestion) => (
                <motion.button
                  key={suggestion}
                  onClick={() => setContent((prev) => (prev ? prev + "\n" + suggestion : suggestion))}
                  className="px-3 py-1.5 text-xs font-medium text-[#3d6b35] bg-[#e8f4e5] border border-[#d4e8d0] rounded-full"
                  whileTap={{ scale: 0.95 }}
                >
                  {suggestion}
                </motion.button>
              )
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── Notes List View ───
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2d4a28]">Catatan</h2>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-[#6a8f62]">
              {notes.length > 0 ? `${notes.length} catatan tersimpan` : "Belum ada catatan"}
            </p>
            {syncStatus === "synced" && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                <MdCloudDone className="w-3 h-3" /> Synced
              </span>
            )}
            {syncStatus === "local" && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                <MdCloudOff className="w-3 h-3" /> Lokal
              </span>
            )}
          </div>
        </div>
        <motion.button
          onClick={() => setShowEditor(true)}
          className="welcome-btn-primary w-10 h-10 flex items-center justify-center !rounded-full !p-0"
          whileTap={{ scale: 0.9 }}
          id="btn-add-note"
        >
          <MdAdd className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Empty state */}
      {notes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center pt-12"
        >
          <div className="w-20 h-20 mb-4 text-[#a8cfa0] bg-[#e8f4e5] rounded-2xl flex items-center justify-center">
            <MdNote className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-[#2d4a28] mb-2">Belum Ada Catatan</h3>
          <p className="text-sm text-[#6a8f62] text-center max-w-[240px] leading-relaxed mb-6">
            Catat makanan, gejala, atau apa saja yang ingin kamu ingat tentang kondisi maagmu.
          </p>
          <motion.button
            onClick={() => setShowEditor(true)}
            className="welcome-btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2"
            whileTap={{ scale: 0.97 }}
          >
            <MdAdd className="w-5 h-5" />
            Tulis Catatan Pertama
          </motion.button>
        </motion.div>
      )}

      {/* Notes list */}
      <AnimatePresence>
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100, height: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="welcome-card p-4 space-y-2"
          >
            {/* Note header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-[#2d4a28] truncate">
                  {note.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MdAccessTime className="w-3 h-3 text-[#a8cfa0]" />
                  <span className="text-[10px] text-[#6a8f62]">
                    {formatDate(note.updatedAt)}
                  </span>
                  {note.source === "server" && (
                    <MdCloudDone className="w-3 h-3 text-green-500" title="Tersinkronisasi" />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <motion.button
                  onClick={() => handleEdit(note)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6a8f62] hover:bg-[#e8f4e5] transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <MdEdit className="w-4 h-4" />
                </motion.button>

                {deleteConfirm === note.id ? (
                  <div className="flex items-center gap-1">
                    <motion.button
                      onClick={() => handleDelete(note.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 bg-red-50"
                      whileTap={{ scale: 0.9 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <MdCheck className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => setDeleteConfirm(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6a8f62] bg-[#e8f4e5]"
                      whileTap={{ scale: 0.9 }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <MdClose className="w-4 h-4" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => setDeleteConfirm(note.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a8cfa0] hover:text-red-500 hover:bg-red-50 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <MdDelete className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Note content preview */}
            <p className="text-xs text-[#5a7d52] leading-relaxed line-clamp-3 whitespace-pre-line">
              {note.content}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
