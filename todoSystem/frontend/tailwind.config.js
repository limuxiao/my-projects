/** @type {import('tailwindcss').Config} */
export default {
  // content 告诉 Tailwind 去哪些文件里扫描类名，只有被扫描到的工具类才会打进最终 CSS
  // 所以动态拼接的类名（如 `text-${color}`）Tailwind 识别不到，要避免
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // extend 是「扩展」而非「覆盖」：保留 Tailwind 默认主题，再追加下面这些自定义值
    extend: {
      // 自定义颜色后，就可以写 bg-paper / text-ink / border-accent 这样的工具类
      colors: {
        paper: '#F6F3EC',
        'paper-deep': '#EDE8DD',
        ink: '#1C1B19',
        'ink-soft': '#4A4842',
        accent: '#C2410C',
        'accent-soft': '#E7A586',
      },
      // 定义字体族后可用 font-display / font-body 调用，标题与正文用不同字体更有层次
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
