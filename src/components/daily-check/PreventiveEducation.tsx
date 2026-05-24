import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdMenuBook, MdExpandMore, MdCheckCircle } from "react-icons/md";

const educationItems = [
  {
    title: "Mengapa Pencegahan Penting?",
    content:
      "Kebiasaan sehari-hari memiliki pengaruh besar terhadap kesehatan lambung.",
    points: [
      "Mengurangi risiko kekambuhan",
      "Mengurangi iritasi lambung",
      "Menjaga kenyamanan lambung",
      "Mengurangi penggunaan obat berlebihan",
    ],
  },
  {
    title: "Pola Makan Sehat untuk Lambung",
    content:
      "Makan teratur dengan porsi kecil lebih baik daripada makan besar sekaligus.",
    points: [
      "Makan 4-5 kali sehari dalam porsi kecil",
      "Hindari makan 2-3 jam sebelum tidur",
      "Kunyah makanan dengan baik",
      "Hindari makanan yang terlalu panas atau dingin",
    ],
  },
  {
    title: "Manajemen Stres",
    content:
      "Stres berlebihan dapat meningkatkan produksi asam lambung dan memperburuk gejala.",
    points: [
      "Lakukan teknik relaksasi secara rutin",
      "Tidur cukup 7-8 jam per hari",
      "Olahraga ringan secara teratur",
      "Hindari begadang yang tidak perlu",
    ],
  },
];

export default function PreventiveEducation() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <h3 className="font-bold text-base text-[#2d4a28] flex items-center gap-2">
        <MdMenuBook className="w-5 h-5 text-[#3d6b35]" />
        Edukasi Preventif
      </h3>

      {educationItems.map((item, index) => (
        <div key={item.title} className="welcome-card overflow-hidden">
          <button
            onClick={() =>
              setExpandedIndex((prev) => (prev === index ? null : index))
            }
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <span className="font-semibold text-sm text-[#2d4a28]">
              {item.title}
            </span>
            <MdExpandMore
              className={`w-5 h-5 text-[#a8cfa0] transition-transform duration-300 ${
                expandedIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {expandedIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <p className="text-xs text-[#6a8f62] mb-3 leading-relaxed">
                    {item.content}
                  </p>
                  <div className="space-y-2">
                    {item.points.map((point) => (
                      <div key={point} className="flex items-start gap-2">
                        <MdCheckCircle className="w-3.5 h-3.5 text-[#3d6b35] shrink-0 mt-0.5" />
                        <span className="text-xs text-[#5a7d52]">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  );
}
