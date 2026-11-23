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

export interface StudyWord {
  id: number
  dayId: number
  seq: number
  word: string
  pos: string
  meaning: string
  exampleEn: string
  exampleZh: string
  hasAudio: boolean
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
