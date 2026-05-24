import { motion } from "framer-motion";
import { MdWarning, MdInfoOutline } from "react-icons/md";

interface TriggerAnalysisProps {
  triggers: string[];
}

export default function TriggerAnalysis({ triggers }: TriggerAnalysisProps) {
  if (triggers.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="welcome-card p-5"
    >
      <h3 className="font-bold text-base text-[#2d4a28] mb-4 flex items-center gap-2">
        <MdWarning className="w-5 h-5 text-amber-600" />
        Pemicu yang Paling Berpengaruh
      </h3>

      {/* Trigger list */}
      <div className="space-y-2 mb-4">
        {triggers.map((trigger, index) => (
          <motion.div
            key={trigger}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-[#e8f4e5]/60 border border-[#d4e8d0] rounded-xl"
          >
            <MdWarning className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm font-medium text-[#2d4a28]">
              {trigger}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Explanation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-3 bg-blue-50/80 border border-blue-200/50 rounded-xl"
      >
        <div className="flex items-start gap-2">
          <MdInfoOutline className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Faktor-faktor tersebut dapat: meningkatkan produksi asam lambung,
            memperburuk iritasi lambung, dan meningkatkan risiko kekambuhan maag.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
