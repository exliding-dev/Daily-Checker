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
} from "react-icons/md";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "maag_notes";

function loadNotes(): Note[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
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

  // Load notes on mount
  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const handleSave = () => {
    if (!content.trim()) return;

    const now = new Date().toISOString();

    if (editingNote) {
      // Update existing
      const updated = notes.map((n) =>
        n.id === editingNote.id
          ? { ...n, title: title.trim() || "Tanpa judul", content: content.trim(), updatedAt: now }
          : n
      );
      setNotes(updated);
      saveNotes(updated);
    } else {
      // Create new
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: title.trim() || "Tanpa judul",
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      saveNotes(updated);
    }

    resetEditor();
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowEditor(true);
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    setDeleteConfirm(null);
  };

  const resetEditor = () => {
    setShowEditor(false);
    setEditingNote(null);
    setTitle("");
    setContent("");
  };

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
            disabled={!content.trim()}
            className={`flex items-center gap-1.5 text-sm font-semibold ${
              content.trim() ? "text-[#3d6b35]" : "text-[#a8cfa0]"
            }`}
            whileTap={content.trim() ? { scale: 0.95 } : undefined}
          >
            <MdCheck className="w-5 h-5" />
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
          <p className="text-xs text-[#6a8f62]">
            {notes.length > 0 ? `${notes.length} catatan tersimpan` : "Belum ada catatan"}
          </p>
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
