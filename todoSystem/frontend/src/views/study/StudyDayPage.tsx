import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleCheck, Film, Loader2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getStudyDay, getStudyUnits } from '@/api/study'
import { StudyLayout } from '@/components/study/StudyLayout'
import { useStudyProgressContext } from '@/components/study/StudyProgressContext'
import { WordCard } from '@/components/study/WordCard'
import { MonthlySummary, WeeklyReview } from '@/components/study/ReviewSummary'
import type { StudyDay, StudyUnit } from '@/types/study'

export function StudyDayPage() {
  const { day: dayParam } = useParams()
  const globalDay = Number(dayParam)
  const [day, setDay] = useState<StudyDay | null>(null)
  const [unit, setUnit] = useState<StudyUnit | null>(null)
  const [error, setError] = useState('')
  const { completed, toggle, loading } = useStudyProgressContext()
  const done = completed.includes(globalDay)

  useEffect(() => {
    if (!Number.isInteger(globalDay) || globalDay < 1 || globalDay > 200) {
      setError('无效的学习日')
      return
    }
    setError('')
    setDay(null)
    getStudyDay(globalDay).then(setDay).catch((e) => setError(e.message))
    getStudyUnits().then((units) => setUnit(units[Math.ceil(globalDay / 10) - 1] ?? null)).catch(() => {})
  }, [globalDay])

  return (
    <StudyLayout currentDay={globalDay}>
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14">
        {error && <p className="border-l-2 border-accent bg-accent/5 px-4 py-3 text-sm text-accent">{error}</p>}
        {!day && !error && (
          <div className="flex items-center gap-2 text-sm text-ink/40"><Loader2 size={15} className="animate-spin" /> 加载中…</div>
        )}

        {day && (
          <>
            <p className="field-label mb-3 text-accent">Day {day.globalDay} / 200</p>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {day.theme}<span className="text-accent">.</span>
            </h1>
            <p className="mt-3 text-sm text-ink/50">{unit?.name} · {unit?.en}</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <DayNav to={`/study/day/${globalDay - 1}`} disabled={globalDay <= 1} icon={<ArrowLeft size={14} />} label="上一天" />
              <DayNav to={`/study/day/${globalDay + 1}`} disabled={globalDay >= 200} icon={<ArrowRight size={14} />} label="下一天" trailing />
              <Link to="/study/films" className="btn-ghost ml-auto py-2 text-xs"><Film size={14} /> 影视推荐</Link>
              <button
                type="button"
                onClick={() => toggle(globalDay)}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold transition-colors ${done ? 'bg-green-600 text-white' : 'border border-ink/20 text-ink hover:border-accent hover:text-accent'}`}
              >
                {done ? <CircleCheck size={14} /> : <Check size={14} />}
                {done ? '已完成' : '标记完成'}
              </button>
            </div>

            {/* 今日单词 */}
            <section className="mt-14">
              <h2 className="font-display text-2xl font-semibold tracking-tight">今日 20 词</h2>
              <p className="mt-2 text-sm text-ink/50">点击喇叭图标跟读，例句中的目标词已高亮。</p>
              <div className="mt-6 border-t border-ink/10">
                {day.words?.map((w, i) => <WordCard key={w.id} word={w} index={i + 1} />)}
              </div>
            </section>

            {/* 跟读短句：取前 5 个例句 */}
            <section className="mt-14 border-t border-ink/10 pt-10">
              <h2 className="font-display text-2xl font-semibold tracking-tight">句子跟读</h2>
              <div className="mt-6 space-y-4">
                {day.words?.slice(0, 5).map((w) => (
                  <div key={w.id} className="border-l-2 border-accent/40 pl-5">
                    <p className="text-sm leading-7 text-ink/75">{w.exampleEn}</p>
                    <p className="mt-1 text-xs text-ink/45">{w.exampleZh}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 短文阅读：单元引导语 + 今日例句串成短文 */}
            {unit && (
              <section className="mt-14 border-t border-ink/10 pt-10">
                <h2 className="font-display text-2xl font-semibold tracking-tight">短文阅读</h2>
                <div className="mt-6 bg-paper-deep/30 p-6 sm:p-8">
                  <p className="font-display text-base leading-8 text-ink/80">{unit.intro}</p>
                  <div className="mt-5 space-y-3 border-l-2 border-accent/30 pl-5">
                    {day.words?.slice(0, 6).map((w) => (
                      <p key={w.id} className="text-sm leading-7 text-ink/70">{w.exampleEn}</p>
                    ))}
                  </div>
                  <p className="mt-5 font-display text-base leading-8 text-ink/80">{unit.outro}</p>
                  <details className="mt-6 text-xs text-ink/45">
                    <summary className="cursor-pointer hover:text-accent">查看中文翻译</summary>
                    <p className="mt-3 leading-7">{unit.introZh}</p>
                    <p className="mt-2 leading-7">{unit.outroZh}</p>
                  </details>
                </div>
              </section>
            )}

            {globalDay % 10 === 0 && <WeeklyReview currentDay={globalDay} />}
            {(globalDay % 30 === 0 || globalDay === 200) && <MonthlySummary currentDay={globalDay} />}

            <div className="mt-16 flex justify-center">
              <DayNav to={`/study/day/${globalDay + 1}`} disabled={globalDay >= 200} icon={<ArrowRight size={15} />} label="下一天" trailing />
            </div>
          </>
        )}
      </div>
    </StudyLayout>
  )
}

function DayNav({ to, disabled, icon, label, trailing }: { to: string; disabled: boolean; icon: ReactNode; label: string; trailing?: boolean }) {
  if (disabled) return <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-ink/20">{trailing && icon}{label}{!trailing && icon}</span>
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-ink/60 hover:text-accent">
      {trailing && icon}{label}{!trailing && icon}
    </Link>
  )
}
