import { motion } from "framer-motion";
import {
  MdCheckCircle,
  MdWarning,
  MdError,
  MdLightbulbOutline,
  MdLocalHospital,
} from "react-icons/md";
import type { DailyCheckResult } from "./types";
import { getRiskConfig } from "./utils";
import RiskScoreCircle from "./RiskScoreCircle";

interface ResultSectionProps {
  result: DailyCheckResult;
}

const riskIcons = {
  low: <MdCheckCircle className="w-6 h-6 text-green-600" />,
  medium: <MdWarning className="w-6 h-6 text-amber-600" />,
  high: <MdError className="w-6 h-6 text-red-600" />,
};

export default function ResultSection({ result }: ResultSectionProps) {
  const config = getRiskConfig(result.riskLevel);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Score circle */}
      <div className="welcome-card p-6">
        <h3 className="text-center text-xs font-semibold text-[#6a8f62] uppercase tracking-widest mb-4">
          Hasil Risiko Harian
        </h3>
        <RiskScoreCircle
          score={result.totalScore}
          maxScore={result.maxScore}
          riskLevel={result.riskLevel}
        />

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-5 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {riskIcons[result.riskLevel]}
            <h4 className={`font-bold text-lg ${config.color}`}>
              {config.headline}
            </h4>
          </div>
          <p className="text-sm text-[#6a8f62] leading-relaxed">
            {config.description}
          </p>
        </motion.div>
      </div>

      {/* Triggers detected */}
      {result.triggers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="welcome-card p-4"
        >
          <h4 className={`font-semibold text-sm mb-3 ${config.color}`}>
            <MdWarning className="w-4 h-4 inline mr-1.5" />
            Pemicu yang Terdeteksi
          </h4>
          <ul className="space-y-2">
            {result.triggers.map((trigger, index) => (
              <motion.li
                key={trigger}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2 text-sm text-[#3d6b35]"
              >
                <MdCheckCircle className={`w-4 h-4 shrink-0 ${config.color}`} />
                {trigger}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* High risk warning */}
      {result.riskLevel === "high" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200"
        >
          <div className="flex items-start gap-2">
            <MdLocalHospital className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-red-700 mb-2">
                Yang Perlu Diperhatikan
              </h4>
              <p className="text-xs text-red-600 leading-relaxed">
                Bila disertai: muntah darah, BAB hitam, nyeri berat, atau muntah
                terus-menerus, segera konsultasi ke fasilitas kesehatan.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="welcome-card p-4"
      >
        <h4 className="font-semibold text-sm text-[#2d4a28] mb-3 flex items-center gap-2">
          <MdLightbulbOutline className="w-4 h-4 text-[#3d6b35]" />
          Saran
        </h4>
        <ul className="space-y-2">
          {config.suggestions.map((suggestion, index) => (
            <motion.li
              key={suggestion}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="flex items-center gap-2 text-sm text-[#5a7d52]"
            >
              <MdCheckCircle className="w-4 h-4 text-[#3d6b35] shrink-0" />
              {suggestion}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
