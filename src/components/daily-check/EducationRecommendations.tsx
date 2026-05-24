import { motion } from "framer-motion";
import {
  MdLocalHospital,
  MdMedication,
  MdRestaurant,
  MdWarning,
  MdMenuBook,
  MdArrowForward,
} from "react-icons/md";
import { educationRecommendations } from "./data";

const iconMap: Record<string, React.ReactNode> = {
  stethoscope: <MdLocalHospital className="w-5 h-5" />,
  pill: <MdMedication className="w-5 h-5" />,
  utensils: <MdRestaurant className="w-5 h-5" />,
  alert: <MdWarning className="w-5 h-5" />,
  book: <MdMenuBook className="w-5 h-5" />,
};

export default function EducationRecommendations() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <h3 className="font-bold text-base text-[#2d4a28] flex items-center gap-2">
        <MdMenuBook className="w-5 h-5 text-[#3d6b35]" />
        Rekomendasi Edukasi
      </h3>

      <p className="text-xs text-[#6a8f62]">
        Berdasarkan hasil Daily Check, pelajari lebih lanjut:
      </p>

      <div className="grid grid-cols-1 gap-2.5">
        {educationRecommendations.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="welcome-card flex items-center gap-3 p-4 text-left group"
            whileTap={{ scale: 0.98 }}
          >
            <div className="welcome-icon-circle shrink-0 text-[#3d6b35]">
              {iconMap[item.icon]}
            </div>
            <span className="text-sm font-medium text-[#2d4a28] flex-1">
              {item.label}
            </span>
            <MdArrowForward className="w-4 h-4 text-[#a8cfa0] group-hover:text-[#3d6b35] transition-colors" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
