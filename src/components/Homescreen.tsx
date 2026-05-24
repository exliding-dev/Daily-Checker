import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdCalendarToday,
  MdRestaurant,
  MdBarChart,
  MdArrowForward,
  MdAccessTime,
  MdHome,
  MdHistory,
  MdNote,
  MdPerson,
  MdVerifiedUser,
  MdEdit,
  MdLogout,
} from "react-icons/md";
import { DailyCheck } from "./daily-check";
import WelcomeScreen from "./LoginScreen";
import NotesTab from "./NotesTab";
import { clearUserSession } from "../lib/api";

import HistoryTab from "./HistoryTab";

type Screen = "welcome" | "main" | "daily-check";
type Tab = "home" | "history" | "notes" | "profile";

export default function Homescreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [userName, setUserName] = useState("");

  // Check if user already has a name saved
  useEffect(() => {
    const savedName = localStorage.getItem("maag_user_name");
    if (savedName) {
      setUserName(savedName);
      setCurrentScreen("main");
    }
  }, []);

  const handleStart = (name: string) => {
    setUserName(name);
    setCurrentScreen("main");
  };

  const handleLogout = () => {
    clearUserSession();
    setUserName("");
    setCurrentScreen("welcome");
    setActiveTab("home");
  };

  if (currentScreen === "welcome") {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (currentScreen === "daily-check") {
    return <DailyCheck onBack={() => setCurrentScreen("main")} />;
  }

  return (
    <div className="welcome-bg min-h-dvh font-[Poppins,sans-serif] flex flex-col relative pb-20 overflow-hidden">
      {/* Decorative leaf elements */}
      <HomeLeafDecor />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-sm mx-auto px-5 py-6 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HomeTabContent 
                userName={userName} 
                onStartDailyCheck={() => setCurrentScreen("daily-check")} 
              />
            </motion.div>
          )}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HistoryTab />
            </motion.div>
          )}
          {activeTab === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <NotesTab />
            </motion.div>
          )}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileTabContent userName={userName} onNameChange={setUserName} onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-safe">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-lg border-t border-[#d4e8d0] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-6 pt-3 pb-5 flex justify-between items-center rounded-t-3xl">
          <NavItem icon={<MdHome />} label="Home" isActive={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <NavItem icon={<MdHistory />} label="Riwayat" isActive={activeTab === "history"} onClick={() => setActiveTab("history")} />
          <div className="relative -top-6">
             <button 
               onClick={() => setCurrentScreen("daily-check")}
               className="welcome-btn-primary w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-xl !rounded-full"
             >
                <MdArrowForward className="w-6 h-6 rotate-[-45deg] mb-0.5" />
             </button>
             <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#3d6b35] whitespace-nowrap">Cek Harian</span>
          </div>
          <NavItem icon={<MdNote />} label="Catatan" isActive={activeTab === "notes"} onClick={() => setActiveTab("notes")} />
          <NavItem icon={<MdPerson />} label="Profil" isActive={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
        </div>
      </div>
    </div>
  );
}

/* ─── Decorative Leaves for Home Screen ──────────────────── */
function HomeLeafDecor() {
  return (
    <>
      <svg className="absolute top-0 right-0 w-32 h-32 text-[#c5ddc0] opacity-30" viewBox="0 0 200 200" fill="none">
        <path d="M200 0c-20 30-60 50-100 60C70 68 40 80 20 110c-5 8-10 18-12 28 30-40 70-55 110-62C158 68 180 40 200 0z" fill="currentColor"/>
      </svg>
      <svg className="absolute top-4 left-0 w-20 h-28 text-[#c5ddc0] opacity-20" viewBox="0 0 140 180" fill="none">
        <path d="M0 20c15 25 40 45 70 55 15 5 28 15 35 30-5-25-20-45-45-55C35 40 15 30 0 20z" fill="currentColor"/>
      </svg>
      <svg className="absolute bottom-28 left-0 w-24 h-32 text-[#b8d4b3] opacity-20" viewBox="0 0 160 200" fill="none">
        <path d="M0 180c10-30 35-55 65-70 15-8 28-18 35-35-2 30-15 55-40 72-15 10-35 20-60 33z" fill="currentColor"/>
      </svg>
    </>
  );
}

/* ─── Bottom Nav Item ──────────────────────────────────── */
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 w-14">
      <div className={`text-2xl transition-colors duration-300 ${isActive ? 'text-[#3d6b35]' : 'text-[#a8cfa0]'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-semibold transition-colors duration-300 ${isActive ? 'text-[#3d6b35]' : 'text-[#8bb583]'}`}>
        {label}
      </span>
      {isActive && (
        <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-[#3d6b35] rounded-full mt-0.5" />
      )}
    </button>
  );
}

/* ─── Home Tab ──────────────────────────────────── */
function HomeTabContent({ userName, onStartDailyCheck }: { userName: string, onStartDailyCheck: () => void }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* User greeting */}
      <motion.div
        className="flex items-center justify-between mb-6 mt-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br from-[#5a9e3e] to-[#3d7a2a] rounded-full shadow-md">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-[#6a8f62] font-medium">
              {greeting} 👋
            </p>
            <h2 className="text-base font-bold text-[#2d4a28]">
              {userName}
            </h2>
          </div>
        </div>
      </motion.div>

      {/* Date bar */}
      <motion.div
        className="bg-white/60 backdrop-blur-sm border border-[#d4e8d0] rounded-xl px-4 py-2.5 flex items-center gap-2 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <MdAccessTime className="w-4 h-4 text-[#6a8f62]" />
        <span className="text-xs text-[#5a7d52] font-medium">{today}</span>
      </motion.div>

      {/* Mascot */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="relative mx-auto w-40 h-40 flex items-center justify-center mb-4">
          <motion.img
            src="/mascot-hero.png"
            alt="Mascot lambung"
            className="w-36 relative z-10 drop-shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <h1 className="text-3xl font-bold text-[#2d4a28] leading-tight">
          Daily
          <br />
          <span className="text-[#3d6b35]">Checker</span>
        </h1>
        <p className="mt-2 text-[#6a8f62] text-sm leading-relaxed px-4">
          Pantau maagmu setiap hari, hidup lebih nyaman setiap saat.
        </p>
      </motion.div>

      {/* Objective Text */}
      <motion.div
        className="bg-white/60 backdrop-blur-sm border border-[#d4e8d0] rounded-2xl p-5 mb-8 text-left shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
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

      {/* CTA */}
      <motion.button
        onClick={onStartDailyCheck}
        className="welcome-btn-primary w-full py-4 text-base font-semibold flex items-center justify-center gap-3 mb-4"
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Mulai Cek Harian
        <MdArrowForward className="w-5 h-5" />
      </motion.button>
    </>
  );
}

/* ─── Profile Tab ──────────────────────────────────── */
interface ProfileTabContentProps {
  userName: string;
  onNameChange: (name: string) => void;
  onLogout: () => void;
}

function ProfileTabContent({ userName, onNameChange, onLogout }: ProfileTabContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);

  const handleSaveName = () => {
    if (editName.trim()) {
      const newName = editName.trim();
      localStorage.setItem("maag_user_name", newName);
      onNameChange(newName);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-8">
      <div className="w-24 h-24 flex items-center justify-center text-4xl font-bold text-white mb-4 bg-gradient-to-br from-[#5a9e3e] to-[#3d7a2a] rounded-full shadow-lg">
        {userName.charAt(0).toUpperCase()}
      </div>

      {isEditing ? (
        <div className="w-full space-y-3 mb-6">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="welcome-input text-center text-lg font-bold"
            autoFocus
          />
          <div className="flex gap-2">
            <motion.button
              onClick={() => { setIsEditing(false); setEditName(userName); }}
              className="welcome-btn-secondary flex-1 py-3 text-sm font-semibold"
              whileTap={{ scale: 0.97 }}
            >
              Batal
            </motion.button>
            <motion.button
              onClick={handleSaveName}
              className="welcome-btn-primary flex-1 py-3 text-sm font-semibold"
              whileTap={{ scale: 0.97 }}
            >
              Simpan
            </motion.button>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold text-[#2d4a28]">{userName}</h2>
          <motion.button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-sm text-[#6a8f62] font-medium mt-1 mb-6"
            whileTap={{ scale: 0.95 }}
          >
            <MdEdit className="w-4 h-4" />
            Ubah nama
          </motion.button>
        </>
      )}

      <p className="text-sm text-[#6a8f62] mb-8">Pengguna Daily Checker</p>

      {/* Info */}
      <div className="w-full welcome-card p-4 space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="welcome-icon-circle">
            <MdVerifiedUser className="w-5 h-5 text-[#3d6b35]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#2d4a28]">Tersinkronisasi</h4>
            <p className="text-xs text-[#6a8f62]">Data tersimpan di server & browser</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <motion.button
        onClick={onLogout}
        className="w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200/60 text-red-600 text-sm font-semibold transition-colors"
        whileTap={{ scale: 0.98 }}
        id="btn-logout"
      >
        <MdLogout className="w-5 h-5" />
        Keluar / Reset Nama
      </motion.button>
    </div>
  );
}

function PlaceholderTab({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="text-center flex flex-col items-center">
      <div className="w-20 h-20 mb-4 text-[#a8cfa0] bg-[#e8f4e5] rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-[#2d4a28] mb-2">{title}</h2>
      <p className="text-sm text-[#6a8f62] max-w-[200px] leading-relaxed">{desc}</p>
    </div>
  );
}

