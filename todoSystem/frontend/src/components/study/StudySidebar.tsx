import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getStudyUnits, searchStudyDays } from '@/api/study'
import type { StudyDay, StudyUnit } from '@/types/study'

// 侧栏目录：按单元分组的 200 天，可折叠、可搜索、显示完成状态
export function StudySidebar({
  completed,
  currentDay,
  onNavigate,
}: {
  completed: number[]
  currentDay?: number
  onNavigate?: () => void
}) {
  const [units, setUnits] = useState<StudyUnit[]>([])
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<StudyDay[] | null>(null)
  const doneSet = useMemo(() => new Set(completed), [completed])

  useEffect(() => {
    getStudyUnits().then(setUnits).catch(() => {})
  }, [])

  // 搜索：按主题或单词中英文过滤，命中结果直接列出
  useEffect(() => {
    if (!query.trim()) {
      setMatches(null)
      return
    }
    const timer = setTimeout(() => {
      searchStudyDays(query.trim()).then(setMatches).catch(() => setMatches([]))
    }, 300) // 简单防抖，避免每敲一个字就发请求
    return () => clearTimeout(timer)
  }, [query])

  function toggle(unitId: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(unitId) ? next.delete(unitId) : next.add(unitId)
      return next
    })
  }

  return (
    <aside className="flex h-full flex-col border-r border-ink/10 bg-paper">
      <div className="border-b border-ink/10 p-5">
        <div className="mb-4 flex items-center justify-between">
          <Link to="/study" className="font-display text-lg font-semibold tracking-tight" onClick={onNavigate}>
            学习计划
          </Link>
          {onNavigate && (
            <button type="button" onClick={onNavigate} aria-label="关闭目录" className="text-ink/40 lg:hidden">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索主题或单词"
            className="w-full border border-ink/15 bg-paper-deep/30 py-2 pl-9 pr-3 text-xs outline-none placeholder:text-ink/30 focus:border-accent"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {matches ? (
          // 搜索结果模式
          <div>
            <p className="px-2 py-2 text-[11px] text-ink/40">找到 {matches.length} 天</p>
            {matches.length === 0 && <p className="px-2 py-4 text-xs text-ink/40">没有匹配的内容</p>}
            {matches.map((day) => (
              <DayLink key={day.globalDay} day={day.globalDay} theme={day.theme} done={doneSet.has(day.globalDay)} active={currentDay === day.globalDay} onClick={onNavigate} />
            ))}
          </div>
        ) : (
          // 正常目录模式
          units.map((unit) => {
            // 单元内某天正在阅读时自动展开
            const open = expanded.has(unit.id) || (currentDay !== undefined && Math.ceil(currentDay / 10) === unit.id)
            return (
              <div key={unit.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggle(unit.id)}
                  className="flex w-full items-center justify-between px-2 py-2.5 text-left text-xs font-semibold text-ink/75 transition-colors hover:text-accent"
                >
                  <span className="truncate">{unit.name}</span>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="ml-2 border-l border-ink/10 pl-2">
                    {Array.from({ length: 10 }, (_, i) => {
                      const day = (unit.id - 1) * 10 + i + 1
                      return <DayLink key={day} day={day} done={doneSet.has(day)} active={currentDay === day} onClick={onNavigate} />
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </nav>
    </aside>
  )
}

function DayLink({ day, theme, done, active, onClick }: { day: number; theme?: string; done: boolean; active: boolean; onClick?: () => void }) {
  return (
    <Link
      to={`/study/day/${day}`}
      onClick={onClick}
      title={theme}
      className={`flex items-center gap-2 px-2 py-1.5 text-xs transition-colors ${active ? 'bg-accent/10 font-semibold text-accent' : 'text-ink/55 hover:text-ink'}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${done ? 'bg-green-600' : 'bg-ink/20'}`} />
      <span className="truncate">Day {day}</span>
    </Link>
  )
}
