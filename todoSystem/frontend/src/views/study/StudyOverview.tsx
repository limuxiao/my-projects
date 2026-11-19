import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, Film, Layers, ListChecks, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getStudyOverview } from '@/api/study'
import { StudyLayout } from '@/components/study/StudyLayout'
import { useStudyProgressContext } from '@/components/study/StudyProgressContext'
import type { StudyOverview as Overview } from '@/types/study'

export function StudyOverviewPage() {
  const [data, setData] = useState<Overview | null>(null)
  const [error, setError] = useState('')
  const { completed } = useStudyProgressContext()

  useEffect(() => {
    getStudyOverview().then(setData).catch((e) => setError(e.message))
  }, [])

  return (
    <StudyLayout>
      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
        <p className="field-label mb-5 flex items-center gap-2 text-accent">
          <Sparkles size={13} /> Six-month plan
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          半年英语四级学习计划<span className="text-accent">.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft/75">
          20 个单元、200 天、4000 个高频词。每天 20 词，配合跟读短句与短文，
          每 10 天一次复习，每 30 天一次总结。循序渐进，把积累变成习惯。
        </p>

        {error && <p className="mt-8 border-l-2 border-accent bg-accent/5 px-4 py-3 text-sm text-accent">{error}</p>}
        {!data && !error && <p className="mt-8 text-sm text-ink/40">加载中…</p>}

        {data && (
          <>
            <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-y border-ink/10 py-9 sm:grid-cols-4">
              {[
                { icon: Layers, n: data.stats.units, label: '单元' },
                { icon: ListChecks, n: data.stats.days, label: '学习日' },
                { icon: BookOpen, n: data.stats.words, label: '单词' },
                { icon: Film, n: data.stats.films, label: '影视推荐' },
              ].map((s) => (
                <div key={s.label}>
                  <s.icon size={18} className="mb-3 text-accent" />
                  <p className="font-display text-3xl font-semibold">{s.n}</p>
                  <p className="field-label mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4 border border-ink/10 bg-paper-deep/30 px-6 py-5">
              <div className="flex-1">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium">学习进度</span>
                  <span className="font-display text-sm font-semibold text-accent">
                    {completed.length} / {data.stats.days} 天
                  </span>
                </div>
                <div className="h-1.5 w-full bg-ink/10">
                  <div className="h-full bg-accent transition-all" style={{ width: `${(completed.length / data.stats.days) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-14">
              <h2 className="font-display text-2xl font-semibold tracking-tight">单元路线图</h2>
              <p className="mt-2 text-sm text-ink/50">点击任意单元，从第一天开始。</p>
              <div className="mt-8 grid gap-px bg-ink/10 sm:grid-cols-2">
                {data.units.map((unit) => {
                  const firstDay = (unit.id - 1) * 10 + 1
                  const doneCount = Array.from({ length: 10 }, (_, i) => (unit.id - 1) * 10 + i + 1).filter((d) => completed.includes(d)).length
                  return (
                    <Link
                      key={unit.id}
                      to={`/study/day/${firstDay}`}
                      className="group bg-paper p-6 transition-colors hover:bg-paper-deep/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="field-label mb-2">Unit {unit.id}</p>
                          <h3 className="font-display text-lg font-semibold group-hover:text-accent">{unit.name}</h3>
                          <p className="mt-1 text-xs text-ink/40">{unit.en}</p>
                        </div>
                        <ArrowRight size={16} className="mt-1 shrink-0 text-ink/25 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                      </div>
                      <p className="mt-4 text-xs leading-6 text-ink/50">{unit.theme}</p>
                      <p className="mt-4 text-[11px] font-medium text-accent">{doneCount}/10 天已完成</p>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="mt-14 border-t border-ink/10 pt-8">
              <Link to="/study/films" className="inline-flex items-center gap-2 font-display text-lg font-semibold text-ink hover:text-accent">
                浏览影视推荐 <ArrowRight size={18} />
              </Link>
              <p className="mt-2 text-sm text-ink/50">14 部原声影片，在真实语境里感受英语。</p>
            </div>
          </>
        )}
      </div>
    </StudyLayout>
  )
}
