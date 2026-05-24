import type { ChecklistCategory } from "./types";

export const checklistData: ChecklistCategory[] = [
  {
    id: "eating-pattern",
    title: "Pola Makan",
    icon: "utensils",
    items: [
      {
        id: "late-eating",
        question: "Telat Makan",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "1 kali", value: "once", score: 1 },
          { label: "\u2265 2 kali", value: "twice-more", score: 2 },
        ],
        education:
          "Telat makan dapat membuat lambung kosong terlalu lama sehingga asam lambung dapat mengiritasi dinding lambung.",
        riskNote: "Nyeri ulu hati, rasa perih, mual, dan maag kambuh.",
      },
      {
        id: "overeating",
        question: "Makan Terlalu Banyak Sekaligus",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 2 },
        ],
        education:
          "Makan dalam porsi terlalu besar dapat membuat lambung bekerja lebih berat dan memicu rasa tidak nyaman.",
      },
      {
        id: "eating-before-sleep",
        question: "Makan Menjelang Tidur",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 2 },
        ],
        education:
          "Tidur setelah makan dapat meningkatkan risiko refluks asam lambung pada sebagian orang.",
      },
    ],
  },
  {
    id: "trigger-foods",
    title: "Makanan & Minuman Pemicu",
    icon: "coffee",
    items: [
      {
        id: "coffee",
        question: "Konsumsi Kopi",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "1 cangkir", value: "one-cup", score: 1 },
          { label: "\u2265 2 cangkir", value: "two-more", score: 2 },
        ],
        education:
          "Kopi mengandung kafein yang dapat meningkatkan produksi asam lambung pada sebagian orang.",
      },
      {
        id: "spicy-food",
        question: "Makanan Pedas",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Sedikit", value: "little", score: 1 },
          { label: "Banyak", value: "much", score: 2 },
        ],
        education:
          "Makanan pedas dapat memperburuk keluhan maag pada sebagian penderita.",
      },
      {
        id: "acidic-food",
        question: "Makanan/Minuman Asam",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 2 },
        ],
        education:
          "Makanan terlalu asam dapat memicu rasa perih dan meningkatkan iritasi lambung.",
      },
      {
        id: "soda",
        question: "Minuman Bersoda",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 2 },
        ],
        education:
          "Minuman bersoda dapat menyebabkan lambung terasa penuh dan kembung.",
      },
      {
        id: "chocolate",
        question: "Cokelat Berlebihan",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 2 },
        ],
        education:
          "Pada sebagian orang, cokelat dapat memperburuk refluks asam lambung.",
      },
    ],
  },
  {
    id: "lifestyle-stress",
    title: "Pola Hidup & Stres",
    icon: "brain",
    items: [
      {
        id: "stress",
        question: "Stres atau Banyak Pikiran",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Kadang-kadang", value: "sometimes", score: 1 },
          { label: "Sering", value: "often", score: 2 },
        ],
        education:
          "Stres dapat memengaruhi pola makan, kualitas tidur, dan sensitivitas lambung.",
      },
      {
        id: "stay-up-late",
        question: "Tidur Larut / Begadang",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 2 },
        ],
        education:
          "Begadang dapat memperburuk pola hidup dan meningkatkan risiko kekambuhan maag.",
      },
      {
        id: "lack-of-sleep",
        question: "Kurang Tidur",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 2 },
        ],
        education:
          "Kurang tidur dapat meningkatkan stres tubuh dan memperburuk keluhan lambung.",
      },
    ],
  },
  {
    id: "medication",
    title: "Penggunaan Obat",
    icon: "pill",
    items: [
      {
        id: "nsaid",
        question: "Konsumsi Obat Anti Nyeri (NSAID)",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 3 },
        ],
        education:
          "NSAID dapat mengiritasi lambung terutama bila digunakan saat perut kosong atau dalam jangka panjang.",
      },
      {
        id: "medicine-empty-stomach",
        question: "Minum Obat Tanpa Makan",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 2 },
        ],
        education:
          "Beberapa obat lebih berisiko mengiritasi lambung bila diminum tanpa makan.",
      },
    ],
  },
  {
    id: "other-habits",
    title: "Kebiasaan Lain",
    icon: "cigarette",
    items: [
      {
        id: "smoking",
        question: "Merokok",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 2 },
        ],
        education:
          "Merokok dapat memperburuk iritasi lambung dan menghambat penyembuhan.",
      },
      {
        id: "alcohol",
        question: "Konsumsi Alkohol",
        options: [
          { label: "Tidak", value: "no", score: 0 },
          { label: "Ya", value: "yes", score: 3 },
        ],
        education:
          "Alkohol dapat meningkatkan iritasi lambung dan memperparah gastritis.",
      },
    ],
  },
];

export const dailyTips = [
  "Jangan melewatkan waktu makan",
  "Makan dalam porsi kecil tetapi teratur",
  "Hindari langsung tidur setelah makan",
  "Batasi kopi dan makanan terlalu pedas",
  "Kelola stres dengan baik",
  "Tidur cukup 7\u20138 jam",
  "Minum air putih yang cukup",
  "Hindari penggunaan obat sembarangan",
];

export const educationRecommendations = [
  { id: "symptoms", label: "Cek Gejala Maag", icon: "stethoscope" },
  { id: "medicine", label: "Edukasi Obat Maag", icon: "pill" },
  { id: "diet", label: "Pola Makan untuk Maag", icon: "utensils" },
  { id: "danger-signs", label: "Tanda Bahaya Maag", icon: "alert" },
  { id: "prevention", label: "Artikel Pencegahan Kekambuhan", icon: "book" },
];
