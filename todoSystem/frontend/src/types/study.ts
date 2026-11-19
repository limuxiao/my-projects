// 英语四级学习计划相关类型，与后端 StudyModule 对齐

export interface StudyUnit {
  id: number
  name: string
  en: string
  theme: string
  intro: string
  introZh: string
  outro: string
  outroZh: string
}

// 单词是 [英文, 词性, 中文释义, 英文例句, 例句翻译] 五元组，后端展开为对象
export interface StudyWord {
  id: number
  dayId: number
  seq: number
  word: string
  pos: string
  meaning: string
  exampleEn: string
  exampleZh: string
}

export interface StudyDay {
  id: number
  unitId: number
  dayNo: number
  globalDay: number
  theme: string
  words?: StudyWord[]
}

export interface StudyFilm {
  id: number
  title: string
  cn: string
  year: string
  genre: string
  level: string
  reason: string
  synopsis: string
  tips: string
  quote: string
  quoteZh: string
  sortOrder: number
}

export interface StudyStats {
  units: number
  days: number
  words: number
  films: number
  wordsPerDay: number
}

export interface StudyOverview {
  stats: StudyStats
  units: StudyUnit[]
}

export interface StudyProgress {
  completed: number[]
  total: number
}
