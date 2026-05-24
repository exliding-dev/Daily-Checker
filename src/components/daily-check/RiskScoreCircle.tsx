import { motion } from "framer-motion";
import type { RiskLevel } from "./types";
import { getRiskConfig } from "./utils";

interface RiskScoreCircleProps {
  score: number;
  maxScore: number;
  riskLevel: RiskLevel;
}

const riskColors = {
  low: { stroke: "#3d7a2a", glow: "rgba(61,122,42,0.2)" },
  medium: { stroke: "#b8860b", glow: "rgba(184,134,11,0.2)" },
  high: { stroke: "#c0392b", glow: "rgba(192,57,43,0.2)" },
};

export default function RiskScoreCircle({
  score,
  maxScore,
  riskLevel,
}: RiskScoreCircleProps) {
  const config = getRiskConfig(riskLevel);
  const colors = riskColors[riskLevel];
  const percentage = Math.round((score / maxScore) * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        {/* Gauge background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#e8f4e5] to-[#d4e8d0] border-2 border-[#c5ddc0] shadow-inner" />

        {/* SVG ring */}
        <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(168,207,160,0.3)"
            strokeWidth="8"
          />
          {/* Fill */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            stroke={colors.stroke}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
              filter: `drop-shadow(0 0 6px ${colors.glow})`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <motion.span
            className={`text-3xl font-bold ${config.color}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {percentage}%
          </motion.span>
          <span className="text-xs text-[#6a8f62] mt-1 font-medium">
            Skor Risiko
          </span>
        </div>
      </div>

      {/* Risk label badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-3 px-5 py-2 text-sm font-semibold text-white rounded-full shadow-md"
        style={{
          background:
            riskLevel === "low"
              ? "linear-gradient(135deg, #4a8f3c 0%, #3d7a2a 100%)"
              : riskLevel === "medium"
              ? "linear-gradient(135deg, #d4a017 0%, #b8860b 100%)"
              : "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
        }}
      >
        {config.label}
      </motion.div>
    </div>
  );
}
