import type { ReactNode } from 'react'
import { Check, ListTodo } from 'lucide-react'

// 这是一个「布局组件」：负责外壳和排版，具体内容通过 props 传进来
// 参数对象后面的 : {...} 是内联类型声明，等价于先定义 interface 再标注
// children 是特殊 prop，代表组件标签之间包裹的内容（这里是表单）
export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    // lg: 是响应式前缀，表示屏幕 ≥1024px 时才应用；min-h-[100dvh] 适配移动端地址栏
    <main className="grid min-h-[100dvh] lg:grid-cols-[1.1fr_1fr]">
      {/* 左侧品牌区：墨色底 + 几何装饰 + 竖向节奏，非对称占比 */}
      <section className="relative hidden overflow-hidden bg-ink px-12 py-14 text-paper lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/4 h-[520px] w-[520px] rounded-full border border-paper/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 top-[18%] h-[360px] w-[360px] rounded-full border border-paper/10"
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-accent">
            <ListTodo size={18} strokeWidth={2.2} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">TodoSystem</span>
        </div>

        <div className="relative max-w-md">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-soft">
            A quieter way to get things done
          </p>
          <h2 className="font-display text-5xl font-semibold leading-[1.08] tracking-tight">
            把要做的事，
            <br />
            安放妥当。
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-paper/55">
            一个专注、克制的待办空间。没有多余的喧哗，只有清晰的任务和完成的节奏。
          </p>
          <ul className="mt-10 space-y-3 text-sm text-paper/70">
            {/* 数组用 map 渲染成列表；key 帮助 React 识别每一项，必须用稳定且唯一的值 */}
            {['按人隔离的私人待办', '干净利落的记录体验', '随时随地的访问'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check size={15} className="text-accent-soft" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs tracking-wide text-paper/35">© 2026 TodoSystem</p>
      </section>

      {/* 右侧表单区：暖纸底，左对齐，充足留白 */}
      <section className="flex min-h-[100dvh] flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10">
            <p className="field-label mb-3 text-accent">{eyebrow}</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-ink/50">{description}</p>
          </div>
          {children}
          <div className="mt-8 border-t border-ink/10 pt-6 text-sm text-ink/55">{footer}</div>
        </div>
      </section>
    </main>
  )
}
