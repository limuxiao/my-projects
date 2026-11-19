import { useEffect, useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { getStudyDay } from '@/api/study'
import type { StudyDay, StudyWord } from '@/types/study'

// 拉取连续若干天的数据（用于复习/总结）
function useDays(from: number, to: number) {
  const [days, setDays] = useState<StudyDay[]>([])
  useEffect(() => {
    let cancelled = false
    Promise.all(
      Array.from({ length: to - from + 1 }, (_, i) => getStudyDay(from + i).catch(() => null)),
    ).then((results) => {
      if (!cancelled) setDays(results.filter((d): d is StudyDay => d !== null))
    })
    return () => { cancelled = true }
  }, [from, to])
  return days
}

// 周复习：每 10 天出现，近 10 天词汇速览 + 7 题看中文回想英文自测
export function WeeklyReview({ currentDay }: { currentDay: number }) {
  const from = currentDay - 9
  const days = useDays(from, currentDay)
  const words = days.flatMap((d) => d.words ?? [])
  const quiz = pickQuiz(words, 7)
  const [shown, setShown] = useState<Set<number>>(new Set())

  function reveal(i: number) {
    setShown((prev) => new Set(prev).add(i))
  }

  return (
    <section className="mt-14 border-t-2 border-accent/30 pt-10">
      <div className="mb-6 flex items-center gap-3">
        <RotateCcw size={18} className="text-accent" />
        <h2 className="font-display text-2xl font-semibold tracking-tight">周复习 · Day {from}–{currentDay}</h2>
      </div>
      <p className="mb-6 text-sm text-ink/50">近 10 天共 {words.length} 词，先快速浏览，再做自测。</p>

      <div className="grid gap-x-8 gap-y-2 border-y border-ink/10 py-6 sm:grid-cols-2">
        {words.map((w, i) => (
          <div key={`${w.id}-${i}`} className="flex items-baseline gap-2 py-1 text-xs">
            <span className="font-medium">{w.word}</span>
            <span className="text-ink/40">{w.pos}</span>
            <span className="ml-auto text-ink/55">{w.meaning}</span>
          </div>
        ))}
      </div>

      <h3 className="mt-10 font-display text-lg font-semibold">自测 · 看中文回想英文</h3>
      <div className="mt-4 space-y-3">
        {quiz.map((w, i) => (
          <div key={w.id} className="flex items-center gap-4 border border-ink/10 bg-paper-deep/20 px-4 py-3">
            <span className="font-display text-xs text-ink/30">{i + 1}</span>
            <span className="flex-1 text-sm">{w.meaning}</span>
            {shown.has(i) ? (
              <span className="font-display text-sm font-semibold text-accent">{w.word}</span>
            ) : (
              <button type="button" onClick={() => reveal(i)} className="inline-flex items-center gap-1 text-xs text-ink/45 hover:text-accent">
                <ChevronDown size={13} /> 显示答案
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// 月总结：每 30 天及第 200 天出现，按旬分块回顾本月词汇
export function MonthlySummary({ currentDay }: { currentDay: number }) {
  const isFinal = currentDay === 200
  const from = isFinal ? 191 : currentDay - 29
  const days = useDays(from, currentDay)
  const words = days.flatMap((d) => d.words ?? [])

  return (
    <section className="mt-14 border-t-2 border-ink pt-10">
      <p className="field-label mb-3 text-accent">{isFinal ? 'Final Review' : 'Monthly Summary'}</p>
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        {isFinal ? '结业复盘 · 200 天完成' : `月总结 · Day ${from}–${currentDay}`}
      </h2>
      <p className="mt-4 text-sm leading-7 text-ink/60">
        {isFinal
          ? '200 天，4000 词，一路走来。把最后这段词汇再过一遍，然后带着这份积累继续前行。'
          : `本月${days.length}天，共回顾 ${words.length} 个单词。按旬分为三段，逐块温习。`}
      </p>

      {[0, 1, 2].map((part) => {
        const chunk = words.slice(part * 200, (part + 1) * 200)
        if (!chunk.length) return null
        return (
          <div key={part} className="mt-8">
            <h3 className="field-label mb-4">第 {part + 1} 旬</h3>
            <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {chunk.map((w, i) => (
                <div key={`${w.id}-${i}`} className="flex items-baseline gap-2 py-1 text-xs">
                  <span className="font-medium">{w.word}</span>
                  <span className="text-ink/55">{w.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}

// 从词表里均匀抽样，避免每次都是前几个词
function pickQuiz(words: StudyWord[], n: number): StudyWord[] {
  if (words.length <= n) return words
  const result: StudyWord[] = []
  const step = words.length / n
  for (let i = 0; i < n; i++) result.push(words[Math.floor(i * step)])
  return result
}
