import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdRestaurant,
  MdLocalCafe,
  MdPsychology,
  MdMedication,
  MdSmokingRooms,
  MdLightbulbOutline,
  MdWarning,
  MdArrowForward,
} from "react-icons/md";
import type { ChecklistCategory, OptionValue } from "./types";

interface ChecklistFormProps {
  categories: ChecklistCategory[];
  answers: Record<string, OptionValue>;
  onAnswer: (itemId: string, value: OptionValue) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  utensils: <MdRestaurant className="w-4 h-4" />,
  coffee: <MdLocalCafe className="w-4 h-4" />,
  brain: <MdPsychology className="w-4 h-4" />,
  pill: <MdMedication className="w-4 h-4" />,
  cigarette: <MdSmokingRooms className="w-4 h-4" />,
};

export default function ChecklistForm({
  categories,
  answers,
  onAnswer,
}: ChecklistFormProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            onClick={() => setActiveCategory(index)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap rounded-full transition-all duration-300 ${
              activeCategory === index
                ? "welcome-btn-primary"
                : "welcome-btn-secondary"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {categoryIcons[category.icon]}
            <span>{category.title}</span>
          </motion.button>
        ))}
      </div>

      {/* Active category content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={categories[activeCategory].id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {categories[activeCategory].items.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="welcome-card p-4"
            >
              {/* Question */}
              <h4 className="font-semibold text-[#2d4a28] text-sm mb-3">
                {item.question}
              </h4>

              {/* Options */}
              <div className="flex flex-wrap gap-2 mb-3">
                {item.options.map((option) => {
                  const isSelected = answers[item.id] === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => onAnswer(item.id, option.value)}
                      className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                        isSelected
                          ? "welcome-btn-primary"
                          : "bg-white/70 backdrop-blur-sm border border-[#d4e8d0] text-[#3d6b35]"
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {option.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* Education - always visible */}
              <div className="bg-[#e8f4e5]/60 backdrop-blur-sm border border-[#d4e8d0] rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <MdLightbulbOutline className="w-4 h-4 text-[#3d7a2a] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#3d6b35] leading-relaxed">
                    {item.education}
                  </p>
                </div>
                {item.riskNote && (
                  <div className="mt-2 flex items-start gap-1.5 ml-6">
                    <MdWarning className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 font-medium">
                      {item.riskNote}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Next Button */}
      {activeCategory < categories.length - 1 && (
        <motion.button
          onClick={() => setActiveCategory(activeCategory + 1)}
          className="w-full py-3.5 mt-2 text-sm font-semibold welcome-btn-secondary flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          Selanjutnya
          <MdArrowForward className="w-4 h-4" />
        </motion.button>
      )}

      {/* Progress indicator dots */}
      <div className="flex justify-center gap-2 pt-4 pb-2">
        {categories.map((_, index) => (
          <motion.div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeCategory ? "w-6 bg-[#3d7a2a]" : "w-2 bg-[#d4e8d0]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
