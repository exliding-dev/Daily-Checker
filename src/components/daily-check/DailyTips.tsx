import { motion } from "framer-motion";
import { MdCheckCircle, MdLightbulbOutline } from "react-icons/md";
import { dailyTips } from "./data";

export default function DailyTips() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="welcome-card p-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(232,244,229,0.9) 0%, rgba(212,232,208,0.9) 100%)",
        borderColor: "rgba(168,207,160,0.4)",
      }}
    >
      <h3 className="font-bold text-base text-[#2d4a28] mb-4 flex items-center gap-2">
        <MdLightbulbOutline className="w-5 h-5 text-[#3d6b35]" />
        Tips Hari Ini
      </h3>

      <div className="space-y-2.5">
        {dailyTips.map((tip, index) => (
          <motion.div
            key={tip}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex items-start gap-2.5"
          >
            <MdCheckCircle className="w-4 h-4 text-[#3d6b35] shrink-0 mt-0.5" />
            <span className="text-sm text-[#3d6b35] leading-relaxed">
              {tip}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
