import type { ChecklistCategory, DailyCheckResult, OptionValue, RiskLevel } from "./types";

/**
 * Calculate the risk score and determine risk level based on user answers.
 */
export function calculateResult(
  answers: Record<string, OptionValue>,
  categories: ChecklistCategory[]
): DailyCheckResult {
  let totalScore = 0;
  let maxScore = 0;
  const triggers: string[] = [];

  for (const category of categories) {
    for (const item of category.items) {
      const selectedValue = answers[item.id];
      const selectedOption = item.options.find((o) => o.value === selectedValue);

      // Calculate max possible score for this item
      const itemMaxScore = Math.max(...item.options.map((o) => o.score));
      maxScore += itemMaxScore;

      if (selectedOption) {
        totalScore += selectedOption.score;
        if (selectedOption.score > 0) {
          triggers.push(item.question);
        }
      }
    }
  }

  const riskLevel = getRiskLevel(totalScore, maxScore);

  return {
    riskLevel,
    totalScore,
    maxScore,
    triggers,
    answers,
  };
}

/**
 * Determine risk level based on score percentage.
 */
function getRiskLevel(score: number, maxScore: number): RiskLevel {
  const percentage = (score / maxScore) * 100;
  if (percentage <= 25) return "low";
  if (percentage <= 55) return "medium";
  return "high";
}

/**
 * Get risk level configuration (colors, labels, etc.)
 */
export function getRiskConfig(level: RiskLevel) {
  const configs = {
    low: {
      label: "Risiko Rendah",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      ringColor: "stroke-green-500",
      gradientFrom: "from-green-400",
      gradientTo: "to-green-600",
      headline: "Kebiasaan Harian Anda Relatif Baik untuk Lambung",
      description:
        "Saat ini kebiasaan harian Anda cenderung lebih aman bagi kesehatan lambung.",
      suggestions: [
        "Pertahankan pola makan teratur",
        "Tetap cukup tidur",
        "Batasi makanan pemicu",
        "Minum air putih yang cukup",
      ],
    },
    medium: {
      label: "Risiko Sedang",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      ringColor: "stroke-amber-500",
      gradientFrom: "from-amber-400",
      gradientTo: "to-amber-600",
      headline: "Ada Beberapa Faktor yang Dapat Memicu Maag",
      description:
        "Beberapa kebiasaan harian Anda dapat meningkatkan risiko keluhan maag atau kekambuhan.",
      suggestions: [
        "Hindari telat makan",
        "Kurangi kopi dan makanan pedas",
        "Perbaiki pola tidur",
        "Kelola stres dengan lebih baik",
      ],
    },
    high: {
      label: "Risiko Tinggi",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      ringColor: "stroke-red-500",
      gradientFrom: "from-red-400",
      gradientTo: "to-red-600",
      headline: "Lambung Anda Berisiko Mengalami Iritasi",
      description:
        "Terdapat beberapa faktor yang dapat memperburuk kondisi lambung bila berlangsung terus-menerus.",
      suggestions: [
        "Kurangi faktor pemicu",
        "Gunakan pola makan lebih teratur",
        "Hindari konsumsi alkohol dan rokok",
        "Konsultasikan bila keluhan sering muncul",
      ],
    },
  };

  return configs[level];
}
