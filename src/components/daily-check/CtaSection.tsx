import { motion } from "framer-motion";
import {
  MdLocalHospital,
  MdRestaurant,
  MdMedication,
  MdInfoOutline,
} from "react-icons/md";

interface CtaSectionProps {
  onReset: () => void;
}

export default function CtaSection({ onReset }: CtaSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Headline */}
      <div className="text-center">
        <h3 className="font-bold text-lg text-[#2d4a28] leading-snug">
          Mulai Jaga Lambung dari Kebiasaan Sehari-hari
        </h3>
        <p className="text-sm text-[#6a8f62] mt-2 leading-relaxed">
          Kebiasaan kecil yang lebih sehat dapat membantu menjaga lambung tetap
          nyaman dan mengurangi risiko maag kambuh.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-2.5">
        <motion.button
          className="welcome-btn-primary w-full flex items-center gap-3 p-4 font-medium text-sm"
          whileTap={{ scale: 0.97 }}
        >
          <MdLocalHospital className="w-5 h-5" />
          Coba Cek Gejala
        </motion.button>
        <motion.button
          className="welcome-btn-secondary w-full flex items-center gap-3 p-4 font-medium text-sm"
          whileTap={{ scale: 0.97 }}
        >
          <MdRestaurant className="w-5 h-5 text-[#3d6b35]" />
          Pelajari Pola Makan Maag
        </motion.button>
        <motion.button
          className="welcome-btn-secondary w-full flex items-center gap-3 p-4 font-medium text-sm"
          whileTap={{ scale: 0.97 }}
        >
          <MdMedication className="w-5 h-5 text-[#3d6b35]" />
          Pelajari Obat Maag
        </motion.button>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="w-full py-3 text-sm text-[#3d6b35] font-semibold hover:text-[#2d4a28] transition-colors"
        id="btn-reset-daily-check"
      >
        Ulangi Daily Check
      </button>

      {/* Disclaimer */}
      <div className="p-4 bg-[#e8f4e5]/60 border border-[#d4e8d0] rounded-xl">
        <div className="flex items-start gap-2">
          <MdInfoOutline className="w-4 h-4 text-[#6a8f62] shrink-0 mt-0.5" />
          <p className="text-xs text-[#6a8f62] leading-relaxed">
            Daily Checker bersifat edukatif dan tidak digunakan sebagai alat
            diagnosis maupun pengganti konsultasi medis profesional.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
