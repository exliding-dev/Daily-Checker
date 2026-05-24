import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowBack, MdBarChart } from "react-icons/md";
import type { DailyCheckResult, OptionValue } from "./types";
import { checklistData } from "./data";
import { calculateResult } from "./utils";
import { submitDailyCheck } from "../../lib/api";
import ChecklistForm from "./ChecklistForm";
import ResultSection from "./ResultSection";
import TriggerAnalysis from "./TriggerAnalysis";
import DailyTips from "./DailyTips";
import PreventiveEducation from "./PreventiveEducation";
import EducationRecommendations from "./EducationRecommendations";
import CtaSection from "./CtaSection";

type ViewState = "form" | "result";

interface DailyCheckProps {
  onBack?: () => void;
}

export default function DailyCheck({ onBack }: DailyCheckProps) {
  const [viewState, setViewState] = useState<ViewState>("form");
  const [answers, setAnswers] = useState<Record<string, OptionValue>>({});
  const [result, setResult] = useState<DailyCheckResult | null>(null);

  const handleAnswer = useCallback((itemId: string, value: OptionValue) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  const handleSubmit = async () => {
    const calculatedResult = calculateResult(answers, checklistData);
    setResult(calculatedResult);

    // Save to localStorage history
    try {
      const saved = localStorage.getItem("maag_history");
      const history = saved ? JSON.parse(saved) : [];
      const newItem = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        result: {
          riskLevel: calculatedResult.riskLevel,
          totalScore: calculatedResult.totalScore,
          maxScore: calculatedResult.maxScore,
          triggers: calculatedResult.triggers,
        },
      };
      localStorage.setItem("maag_history", JSON.stringify([newItem, ...history]));
    } catch (e) {
      console.error("Gagal menyimpan riwayat harian", e);
    }

    // Send to WordPress backend
    try {
      const response = await submitDailyCheck({
        riskLevel: calculatedResult.riskLevel,
        totalScore: calculatedResult.totalScore,
        maxScore: calculatedResult.maxScore,
        triggers: calculatedResult.triggers,
        answers: calculatedResult.answers,
      });
      if (!response.success) {
        console.warn("[MAAG API] Gagal menyimpan ke server:", response.message);
      }
    } catch (e) {
      console.error("[MAAG API] Error saat mengirim data:", e);
    }

    setViewState("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setViewState("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Count answered questions
  const totalQuestions = checklistData.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  );
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="welcome-bg min-h-dvh font-[Poppins,sans-serif]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#3d7a2a] via-[#4a8f3c] to-[#3d7a2a] border-b border-[#2d5f1e]/20 shadow-[0_3px_12px_rgba(0,0,0,0.1)]">
        <div className="max-w-sm mx-auto px-4 py-3 flex items-center gap-3">
          <motion.button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white/15 border border-white/20 backdrop-blur-sm shadow-sm"
            whileTap={{ scale: 0.9 }}
            aria-label="Kembali"
            id="btn-daily-check-back"
          >
            <MdArrowBack className="w-5 h-5 text-white/90" />
          </motion.button>
          <div className="flex-1">
            <h1 className="font-bold text-sm text-white drop-shadow-sm">
              {viewState === "form" ? "Daily Check" : "Hasil Daily Check"}
            </h1>
            {viewState === "form" && (
              <p className="text-xs text-white/60">
                {answeredCount}/{totalQuestions} pertanyaan dijawab
              </p>
            )}
          </div>
        </div>

        {/* Progress bar (form view only) */}
        {viewState === "form" && (
          <div className="mx-4 mb-2 h-2 rounded-full bg-white/15 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-white/80"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-sm mx-auto px-4 py-5">
        <AnimatePresence mode="wait">
          {viewState === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Intro */}
              <div className="welcome-card p-4">
                <h2 className="font-bold text-sm text-[#2d4a28] mb-1">
                  Checklist Harian
                </h2>
                <p className="text-xs text-[#6a8f62] leading-relaxed">
                  Dalam 24 jam terakhir, apakah Anda mengalami atau melakukan hal
                  berikut?
                </p>
              </div>

              {/* Checklist form */}
              <ChecklistForm
                categories={checklistData}
                answers={answers}
                onAnswer={handleAnswer}
              />

              {/* Submit button */}
              <motion.button
                onClick={handleSubmit}
                disabled={answeredCount === 0}
                className={`w-full py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  answeredCount > 0
                    ? "welcome-btn-primary"
                    : "welcome-btn-secondary opacity-50 cursor-not-allowed"
                }`}
                whileTap={answeredCount > 0 ? { scale: 0.98 } : undefined}
                id="btn-submit-daily-check"
              >
                <MdBarChart className="w-5 h-5" />
                Lihat Hasil Daily Check
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Section 3: Result */}
              {result && <ResultSection result={result} />}

              {/* Section 4: Trigger Analysis */}
              {result && result.triggers.length > 0 && (
                <TriggerAnalysis triggers={result.triggers} />
              )}

              {/* Section 5: Daily Tips */}
              <DailyTips />

              {/* Section 6: Preventive Education */}
              <PreventiveEducation />

              {/* Section 7: Education Recommendations */}
              <EducationRecommendations />

              {/* Final CTA */}
              <CtaSection onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
