import { useEffect, useState, type ReactNode } from 'react'
import { Clapperboard, Quote } from 'lucide-react'
import { getStudyFilms } from '@/api/study'
import { StudyLayout } from '@/components/study/StudyLayout'
import type { StudyFilm } from '@/types/study'

export function StudyFilmsPage() {
  const [films, setFilms] = useState<StudyFilm[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getStudyFilms().then(setFilms).catch((e) => setError(e.message))
  }, [])

  return (
    <StudyLayout>
      <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10 sm:py-16">
        <p className="field-label mb-5 flex items-center gap-2 text-accent"><Clapperboard size={13} /> Watch & learn</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">影视推荐<span className="text-accent">.</span></h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-soft/75">
          14 部英语原声影片，按难度递进。看故事，也在真实语境里体会英语的节奏与表达。
        </p>

        {error && <p className="mt-8 border-l-2 border-accent bg-accent/5 px-4 py-3 text-sm text-accent">{error}</p>}
        {!films.length && !error && <p className="mt-8 text-sm text-ink/40">加载中…</p>}

        <div className="mt-12 space-y-4">
          {films.map((film, i) => (
            <article key={film.id} className="border border-ink/10 bg-paper-deep/20 p-6 transition-colors hover:border-accent/40 sm:p-8">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-display text-xs text-ink/30">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-display text-xl font-semibold tracking-tight">{film.title}</h2>
                <span className="text-sm text-ink/50">{film.cn}</span>
                <span className="ml-auto text-xs text-ink/40">{film.year}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag>{film.genre}</Tag>
                <Tag>{film.level}</Tag>
              </div>
              <p className="mt-5 text-sm leading-7 text-ink/70"><strong className="text-accent">推荐理由：</strong>{film.reason}</p>
              <p className="mt-3 text-sm leading-7 text-ink/60">{film.synopsis}</p>
              <div className="mt-5 border-l-2 border-accent/40 bg-paper/60 py-3 pl-5 pr-4">
                <Quote size={14} className="mb-2 text-accent/60" />
                <p className="font-display text-sm italic leading-7 text-ink/80">{film.quote}</p>
                <p className="mt-1 text-xs text-ink/45">{film.quoteZh}</p>
              </div>
              <p className="mt-5 text-xs leading-6 text-ink/50"><strong className="text-ink/70">学习建议：</strong>{film.tips}</p>
            </article>
          ))}
        </div>
      </div>
    </StudyLayout>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="border border-ink/15 px-2.5 py-1 text-[11px] text-ink/55">{children}</span>
}
