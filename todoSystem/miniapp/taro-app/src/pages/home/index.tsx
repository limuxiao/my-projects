import React, { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import GuestGate from '@/components/GuestGate'
import { getStudyOverview, getStudyProgress } from '@/api/study'
import { isLoggedIn, requireLogin } from '@/utils/auth'
import type { StudyOverview } from '@/types/study'
import './index.scss'

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [overview, setOverview] = useState<StudyOverview | null>(null)
  const [completed, setCompleted] = useState<number[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudyOverview()
      .then(setOverview)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useDidShow(() => {
    const ok = isLoggedIn()
    setLoggedIn(ok)
    if (ok) {
      getStudyProgress()
        .then((p) => setCompleted(p.completed))
        .catch(() => setCompleted([]))
    } else {
      setCompleted([])
    }
  })

  function openDay(day: number) {
    if (!requireLogin('home')) return
    Taro.navigateTo({ url: `/pages/study-day/index?day=${day}` })
  }

  const stats = overview
    ? [
        { n: overview.stats.units, label: '单元' },
        { n: overview.stats.days, label: '学习日' },
        { n: overview.stats.words, label: '单词' },
        { n: overview.stats.films, label: '影视推荐' }
      ]
    : []

  const pct =
    overview && overview.stats.days > 0
      ? Math.min(100, Math.round((completed.length / overview.stats.days) * 100))
      : 0

  return (
    <View className='page'>
      <View className='hero-header'>
        <View className='hero-badge'>ENGLISH PLAN</View>
        <View className='hero-title'>英语学习计划</View>
        <View className='hero-subtitle'>半年四级 · 20 单元 · 每天 20 词</View>
      </View>

      <View className='wrap'>
        {!loggedIn ? (
          <GuestGate
            icon='📚'
            title='登录后开始学习'
            desc='学习计划可先浏览，标记进度与每日学习需要先登录账号。'
            ctaText='去登录'
            from='home'
          />
        ) : (
          <View className='progress-card'>
            <View className='progress-top'>
              <Text className='progress-label'>学习进度</Text>
              <Text className='progress-count'>
                {completed.length} / {overview?.stats.days || 200} 天
              </Text>
            </View>
            <View className='progress-track'>
              <View className='progress-fill' style={{ width: `${pct}%` }} />
            </View>
            <Text className='progress-tip'>已登录，学习进度将自动同步到云端</Text>
          </View>
        )}

        {error ? <View className='error-bar'>{error}</View> : null}
        {loading && !error ? <View className='loading'>加载中…</View> : null}

        {overview ? (
          <>
            <View className='stats-grid'>
              {stats.map((s) => (
                <View className='stat-box' key={s.label}>
                  <Text className='stat-num'>{s.n}</Text>
                  <Text className='stat-label'>{s.label}</Text>
                </View>
              ))}
            </View>

            <View className='section-head'>
              <View className='bar' />
              <Text className='title-text'>单元路线图</Text>
            </View>
            <Text className='section-desc'>点击任意单元，从第一天开始学习。</Text>

            <View className='unit-list'>
              {overview.units.map((unit) => {
                const firstDay = (unit.id - 1) * 10 + 1
                const doneCount = Array.from({ length: 10 }, (_, i) => (unit.id - 1) * 10 + i + 1).filter((d) =>
                  completed.includes(d)
                ).length
                return (
                  <View className='unit-card' key={unit.id} onClick={() => openDay(firstDay)}>
                    <View className='unit-top'>
                      <Text className='unit-no'>UNIT {unit.id}</Text>
                      <Text className={`unit-done ${doneCount === 10 ? 'all-done' : ''}`}>
                        {doneCount}/10 天
                      </Text>
                    </View>
                    <Text className='unit-name'>{unit.name}</Text>
                    <Text className='unit-en'>{unit.en}</Text>
                    <Text className='unit-theme'>{unit.theme}</Text>
                    <Text className='unit-go'>进入学习 ›</Text>
                  </View>
                )
              })}
            </View>
          </>
        ) : null}
      </View>
    </View>
  )
}
