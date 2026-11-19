import type { ReactNode } from 'react'
import { Volume2 } from 'lucide-react'
import type { StudyWord } from '@/types/study'

// 单词卡：英文 + 词性 + 释义 + 例句，例句中的目标词高亮
export function WordCard({ word, index }: { word: StudyWord; index: number }) {
  function speak() {
    // 用浏览器内置语音合成做跟读，无需后端音频资源
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${word.word}. ${word.exampleEn}`)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="group border-b border-ink/10 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-xs text-ink/30">{String(index).padStart(2, '0')}</span>
            <h3 className="font-display text-xl font-semibold tracking-tight">{word.word}</h3>
            <span className="text-xs italic text-accent">{word.pos}</span>
          </div>
          <p className="mt-2 pl-7 text-sm text-ink-soft">{word.meaning}</p>
        </div>
        <button
          type="button"
          onClick={speak}
          aria-label={`朗读 ${word.word}`}
          className="shrink-0 rounded-full border border-ink/15 p-2 text-ink/40 transition-colors hover:border-accent hover:text-accent"
        >
          <Volume2 size={15} />
        </button>
      </div>
      <div className="mt-4 border-l-2 border-accent/40 bg-paper-deep/30 py-3 pl-5 pr-4">
        <p className="text-sm leading-6 text-ink/75">{highlightWord(word.exampleEn, word.word)}</p>
        <p className="mt-1.5 text-xs leading-6 text-ink/45">{word.exampleZh}</p>
      </div>
    </div>
  )
}

// 把例句中出现的目标词（含简单词形变化）包一层高亮
function highlightWord(text: string, word: string): ReactNode {
  const base = word.replace(/[^a-zA-Z]/g, '')
  if (!base) return text
  const regex = new RegExp(`\\b(${base}\\w*)\\b`, 'gi')
  const parts: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push(<mark key={match.index} className="bg-accent/15 text-accent">{match[0]}</mark>)
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
