import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdHistory,
  MdDelete,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdAccessTime,
  MdCloudDone,
  MdCloudOff,
} from "react-icons/md";
import { getDailyCheckHistory, deleteDailyCheck, isUserRegistered } from "../lib/api";

interface HistoryItem {
  id: string;
  date: string;
  source: "server" | "local";
  result: {
    riskLevel: "low" | "medium" | "high";
    totalScore: number;
    maxScore: number;
    triggers: string[];
  };
}

const STORAGE_KEY = "maag_history";

function loadLocalHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const items = data ? JSON.parse(data) : [];
    return items.map((item: any) => ({ ...item, source: "local" as const }));
  } catch {
    return [];
  }
}

function saveLocalHistory(history: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const riskConfig = {
  low: {
    label: "Risiko Rendah",
    color: "text-green-600 bg-green-50 border-green-200",
    icon: <MdCheckCircle className="w-5 h-5 text-green-600" />,
  },
  medium: {
    label: "Risiko Sedang",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: <MdWarning className="w-5 h-5 text-amber-600" />,
  },
  high: {
    label: "Risiko Tinggi",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: <MdError className="w-5 h-5 text-red-600" />,
  },
};

export default function HistoryTab() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"synced" | "local" | "loading">("loading");

  // Load history from both server and local
  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      const localHistory = loadLocalHistory();

      if (isUserRegistered()) {
        try {
          const response = await getDailyCheckHistory(1, 100);
          if (response.success && response.data) {
            // Map server data to HistoryItem format
            const serverHistory: HistoryItem[] = response.data.map((item: any) => ({
              id: item.uuid,
              date: item.checked_at,
              source: "server" as const,
              result: {
                riskLevel: item.risk_level,
                totalScore: item.total_score,
                maxScore: item.max_score,
                triggers: item.triggers || [],
              },
            }));

            // Merge: prefer server data, add any local-only items
            const serverIds = new Set(serverHistory.map((h) => h.id));
            const localOnly = localHistory.filter((h) => !serverIds.has(h.id));
            const merged = [...serverHistory, ...localOnly].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setHistory(merged);
            setSyncStatus("synced");
          } else {
            // Server error — fall back to local
            setHistory(localHistory);
            setSyncStatus("local");
          }
        } catch {
          setHistory(localHistory);
          setSyncStatus("local");
        }
      } else {
        setHistory(localHistory);
        setSyncStatus("local");
      }

      setIsLoading(false);
    }

    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    // Optimistic delete from UI
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);

    // Remove from localStorage
    const localUpdated = loadLocalHistory().filter((item) => item.id !== id);
    saveLocalHistory(localUpdated);

    // Delete from server too
    if (isUserRegistered()) {
      try {
        await deleteDailyCheck(id);
      } catch (e) {
        console.error("[MAAG API] Failed to delete from server:", e);
      }
    }

    setDeleteConfirm(null);
  };

  const handleClearAll = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua riwayat check harian?")) {
      // Delete all from server
      if (isUserRegistered()) {
        for (const item of history) {
          try {
            await deleteDailyCheck(item.id);
          } catch (e) {
            console.error("[MAAG API] Failed to delete:", e);
          }
        }
      }

      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center pt-16">
        <motion.div
          className="w-8 h-8 border-3 border-[#d4e8d0] border-t-[#3d6b35] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-sm text-[#6a8f62] mt-3">Memuat riwayat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#2d4a28]">Riwayat Check</h2>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-[#6a8f62]">
              {history.length > 0
                ? `${history.length} pemeriksaan tercatat`
                : "Belum ada riwayat pemeriksaan"}
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
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-600 font-semibold hover:text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 transition-colors"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {/* Empty State */}
      {history.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center pt-16"
        >
          <div className="w-20 h-20 mb-4 text-[#a8cfa0] bg-[#e8f4e5] rounded-2xl flex items-center justify-center">
            <MdHistory className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-[#2d4a28] mb-2">Belum Ada Riwayat</h3>
          <p className="text-sm text-[#6a8f62] text-center max-w-[240px] leading-relaxed">
            Lakukan "Daily Check" untuk memantau kondisi dan pemicu maag harian Anda.
          </p>
        </motion.div>
      )}

      {/* History List */}
      <AnimatePresence>
        {history.map((item, index) => {
          const config = riskConfig[item.result.riskLevel || "low"];
          const percentage = Math.round((item.result.totalScore / item.result.maxScore) * 100);
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="welcome-card p-4 space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <MdAccessTime className="w-3.5 h-3.5 text-[#a8cfa0]" />
                    <span className="text-xs text-[#6a8f62] font-medium">
                      {formatDate(item.date)}
                    </span>
                    {item.source === "server" && (
                      <MdCloudDone className="w-3 h-3 text-green-500" title="Tersinkronisasi" />
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                {deleteConfirm === item.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 rounded-lg shadow-sm"
                    >
                      Ya
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#6a8f62] bg-[#e8f4e5] rounded-lg"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#a8cfa0] hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <MdDelete className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status & Score */}
              <div className="flex items-center justify-between p-3 bg-white/70 backdrop-blur-sm border border-[#d4e8d0] rounded-xl">
                <div className="flex items-center gap-2">
                  {config.icon}
                  <span className="text-sm font-semibold text-[#2d4a28]">
                    {config.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#2d4a28]">
                    Skor: {percentage}%
                  </span>
                  <p className="text-[10px] text-[#6a8f62]">
                    ({item.result.totalScore} / {item.result.maxScore} poin)
                  </p>
                </div>
              </div>

              {/* Triggers */}
              {item.result.triggers && item.result.triggers.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#6a8f62] uppercase tracking-wider">
                    Pemicu Terdeteksi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.result.triggers.map((trigger) => (
                      <span
                        key={trigger}
                        className="px-2.5 py-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-100 rounded-lg"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-[#6a8f62] italic">
                  Tidak ada pemicu utama yang terdeteksi.
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
