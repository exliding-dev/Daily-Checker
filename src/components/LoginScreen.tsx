import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdPerson,
  MdArrowForward,
  MdVerifiedUser,
  MdCalendarToday,
  MdRestaurant,
  MdBarChart,
} from "react-icons/md";
import { registerUser } from "../lib/api";

interface WelcomeScreenProps {
  onStart: (name: string) => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [showNameInput, setShowNameInput] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }

    setIsLoading(true);

    // Register user to WordPress backend
    try {
      const response = await registerUser(name.trim());
      if (!response.success) {
        console.warn("[MAAG API] Registration warning:", response.message);
      }
    } catch (e) {
      console.error("[MAAG API] Registration error:", e);
    }

    // Save name to localStorage
    localStorage.setItem("maag_user_name", name.trim());
    setIsLoading(false);
    onStart(name.trim());
  };

  // ─── Name Input View ───
  if (showNameInput) {
    return (
      <div className="welcome-bg min-h-dvh flex flex-col items-center justify-center px-6 py-8 font-[Poppins,sans-serif] relative overflow-hidden">
        <LeafDecorations />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Back button */}
          <motion.button
            onClick={() => setShowNameInput(false)}
            className="mb-6 flex items-center gap-2 text-sm text-[#3d6b35] font-medium"
            whileTap={{ scale: 0.95 }}
          >
            <MdArrowForward className="w-5 h-5 rotate-180" />
            Kembali
          </motion.button>

          {/* Mascot */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mx-auto w-24 h-24 mb-3">
              <motion.img
                src="/mascot-hero.png"
                alt="Mascot lambung"
                className="w-24 h-24 object-contain drop-shadow-md"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <h1 className="text-2xl font-bold text-[#2d4a28] tracking-tight">
              Siapa Nama Kamu?
            </h1>
            <p className="text-sm text-[#5a7d52] mt-1">
              Kami ingin mengenal kamu lebih baik
            </p>
          </motion.div>

          {/* Name form card */}
          <motion.div
            className="welcome-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <form onSubmit={handleSubmitName} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#3d6b35] mb-1.5 ml-1">
                  Nama kamu
                </label>
                <div className="relative">
                  <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7da874]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama kamu"
                    className="welcome-input pl-12"
                    id="input-name"
                    autoFocus
                  />
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                      <p className="text-xs text-red-600 font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className={`welcome-btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-3 ${
                  isLoading ? "opacity-70" : ""
                }`}
                whileTap={{ scale: 0.97 }}
                id="btn-submit-name"
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <>
                    Mulai Sekarang
                    <MdArrowForward className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="mt-5 flex items-center justify-center gap-2 text-[#5a7d52] text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <MdVerifiedUser className="w-4 h-4 text-[#3d6b35]" />
            <span>Data kamu aman dan tersinkronisasi</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ─── Welcome / Onboarding View ───
  return (
    <div className="welcome-bg min-h-dvh flex flex-col font-[Poppins,sans-serif] relative overflow-hidden">
      <LeafDecorations />

      <div className="flex-1 flex flex-col items-center w-full max-w-sm mx-auto px-6 pt-12 pb-8 relative z-10">
        {/* Hero mascot */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative mx-auto w-52 h-52 flex items-center justify-center mb-2">
            <motion.img
              src="/mascot-hero.png"
              alt="Mascot lambung sehat"
              className="w-48 h-48 object-contain relative z-10 drop-shadow-lg"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <motion.h1
            className="text-4xl font-bold text-[#2d4a28] leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Daily
            <br />
            <span className="text-[#3d6b35]">Checker</span>
          </motion.h1>
          <motion.p
            className="mt-3 text-[#5a7d52] text-sm leading-relaxed px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Pantau maagmu setiap hari,
            <br />
            hidup lebih nyaman setiap saat.
          </motion.p>
        </motion.div>

        {/* Objective Text */}
        <motion.div
          className="w-full bg-white/60 backdrop-blur-sm border border-[#d4e8d0] rounded-2xl p-5 mb-8 text-left shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-[#2d4a28] font-semibold text-sm mb-3">
            Daily Checker dirancang untuk membantu pengguna:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#e8f4e5] text-[#3d6b35] flex items-center justify-center shrink-0 mt-0.5 border border-[#c5ddc0]">
                <span className="text-xs font-bold">✔</span>
              </div>
              <span className="text-[#5a7d52] text-sm leading-relaxed">lebih sadar terhadap kebiasaan sehari-hari,</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#e8f4e5] text-[#3d6b35] flex items-center justify-center shrink-0 mt-0.5 border border-[#c5ddc0]">
                <span className="text-xs font-bold">✔</span>
              </div>
              <span className="text-[#5a7d52] text-sm leading-relaxed">memahami faktor pemicu maag,</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#e8f4e5] text-[#3d6b35] flex items-center justify-center shrink-0 mt-0.5 border border-[#c5ddc0]">
                <span className="text-xs font-bold">✔</span>
              </div>
              <span className="text-[#5a7d52] text-sm leading-relaxed">dan membangun pola hidup yang lebih ramah bagi lambung</span>
            </li>
          </ul>
        </motion.div>

        <div className="flex-1" />

        {/* CTA */}
        <motion.div
          className="w-full space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.button
            onClick={() => setShowNameInput(true)}
            className="welcome-btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-3"
            whileTap={{ scale: 0.97 }}
            id="btn-mulai-sekarang"
          >
            Mulai Sekarang
            <MdArrowForward className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-4 flex items-center justify-center gap-2 text-[#6a8f62] text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <MdVerifiedUser className="w-4 h-4" />
          <span>Data kamu aman dan tersinkronisasi</span>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Leaf Decorations (SVG) ──────────────────────────────────── */
function LeafDecorations() {
  return (
    <>
      <svg className="absolute top-0 right-0 w-40 h-40 text-[#c5ddc0] opacity-40" viewBox="0 0 200 200" fill="none">
        <path d="M200 0c-20 30-60 50-100 60C70 68 40 80 20 110c-5 8-10 18-12 28 30-40 70-55 110-62C158 68 180 40 200 0z" fill="currentColor"/>
        <path d="M200 30c-15 25-45 45-80 55-20 6-40 15-55 30 25-20 55-30 85-35 18-4 35-20 50-50z" fill="currentColor" opacity="0.5"/>
      </svg>
      <svg className="absolute top-8 left-0 w-28 h-36 text-[#c5ddc0] opacity-30" viewBox="0 0 140 180" fill="none">
        <path d="M0 20c15 25 40 45 70 55 15 5 28 15 35 30-5-25-20-45-45-55C35 40 15 30 0 20z" fill="currentColor"/>
        <path d="M10 60c10 20 30 38 55 48 12 5 22 14 28 26-5-20-18-38-38-48-15-7-32-16-45-26z" fill="currentColor" opacity="0.6"/>
      </svg>
      <svg className="absolute bottom-20 left-0 w-32 h-40 text-[#b8d4b3] opacity-25" viewBox="0 0 160 200" fill="none">
        <path d="M0 180c10-30 35-55 65-70 15-8 28-18 35-35-2 30-15 55-40 72-15 10-35 20-60 33z" fill="currentColor"/>
        <path d="M5 140c8-20 25-38 48-48 10-5 20-13 26-24-2 22-12 40-30 52-12 8-28 14-44 20z" fill="currentColor" opacity="0.6"/>
      </svg>
      <svg className="absolute bottom-24 right-0 w-28 h-32 text-[#b8d4b3] opacity-20" viewBox="0 0 140 160" fill="none">
        <path d="M140 140c-12-25-35-45-62-52-14-4-26-12-34-25 5 25 20 45 42 55 15 7 32 14 54 22z" fill="currentColor"/>
      </svg>
      <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-[#a8cfa0] opacity-30" />
      <div className="absolute top-[25%] right-[15%] w-1.5 h-1.5 rounded-full bg-[#b8d4b3] opacity-25" />
      <div className="absolute bottom-[35%] left-[12%] w-1 h-1 rounded-full bg-[#a8cfa0] opacity-20" />
    </>
  );
}

