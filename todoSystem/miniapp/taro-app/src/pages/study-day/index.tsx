import React, { useEffect, useRef, useState } from 'react'
import { Text, View } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import {
  getStudyDay,
  getStudyProgress,
  getStudyUnits,
  markStudyDayDone,
  unmarkStudyDayDone
} from '@/api/study'
import { isLoggedIn, requireLogin } from '@/utils/auth'
import { audioUrl } from '@/utils/request'
import type { StudyDay, StudyUnit } from '@/types/study'
import './index.scss'

export default function StudyDayPage() {
  const router = useRouter()
  const globalDay = Number(router.params.day)
  const [day, setDay] = useState<StudyDay | null>(null)
  const [unit, setUnit] = useState<StudyUnit | null>(null)
  const [completed, setCompleted] = useState<number[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const audioRef = useRef<ReturnType<typeof Taro.createInnerAudioContext> | null>(null)

  useEffect(() => {
    if (!Number.isInteger(globalDay) || globalDay < 1 || globalDay > 200) {
      setError('无效的学习日')
      return
    }
    setError('')
    setDay(null)
    getStudyDay(globalDay)
      .then(setDay)
      .catch((e: Error) => setError(e.message))
    getStudyUnits()
      .then((units) => setUnit(units[Math.ceil(globalDay / 10) - 1] || null))
      .catch(() => {})
  }, [globalDay])

  useDidShow(() => {
    if (!isLoggedIn()) {
      setCompleted([])
      return
    }
    getStudyProgress()
      .then((p) => setCompleted(p.completed))
      .catch(() => setCompleted([]))
  })

  function goDay(target: number) {
    if (target < 1 || target > 200) return
    Taro.redirectTo({ url: `/pages/study-day/index?day=${target}` })
  }

  function playAudio(id: number) {
    if (!audioRef.current) {
      audioRef.current = Taro.createInnerAudioContext()
      audioRef.current.onError(() => {
        Taro.showToast({ title: '音频加载失败', icon: 'none' })
      })
    }
    audioRef.current.src = audioUrl(id)
    audioRef.current.play()
  }

  async function toggleDone() {
    if (!requireLogin(`study-day:${globalDay}`) || busy) return
    const wasDone = completed.includes(globalDay)
    setCompleted((prev) =>
      wasDone ? prev.filter((d) => d !== globalDay) : [...prev, globalDay].sort((a, b) => a - b)
    )
    setBusy(true)
    try {
      if (wasDone) await unmarkStudyDayDone(globalDay)
      else await markStudyDayDone(globalDay)
    } catch (e) {
      setCompleted((prev) =>
        wasDone
          ? [...prev, globalDay].sort((a, b) => a - b)
          : prev.filter((d) => d !== globalDay)
      )
      Taro.showToast({ title: (e as Error).message, icon: 'none' })
    } finally {
      setBusy(false)
    }
  }

  const done = completed.includes(globalDay)

  if (error) {
    return (
      <View className='page'>
        <View className='wrap'>
          <View className='error-bar'>{error}</View>
        </View>
      </View>
    )
  }

  if (!day) {
    return (
      <View className='page'>
        <View className='wrap'>
          <View className='loading'>加载中…</View>
        </View>
      </View>
    )
  }

  return (
    <View className='page'>
      <View className='day-header'>
        <Text className='day-badge'>
          DAY {day.globalDay} / 200
        </Text>
        <Text className='day-theme'>{day.theme}</Text>
        <Text className='day-unit'>{unit?.name} · {unit?.en}</Text>
      </View>

      <View className='wrap'>
        <View className='day-nav'>
          <View className={globalDay <= 1 ? 'nav-btn disabled' : 'nav-btn'} onClick={() => goDay(globalDay - 1)}>
            ‹ 上一天
          </View>
          <View className={globalDay >= 200 ? 'nav-btn disabled' : 'nav-btn'} onClick={() => goDay(globalDay + 1)}>
            下一天 ›
          </View>
        </View>

        <View className={`done-btn ${done ? 'is-done' : ''}`} onClick={toggleDone}>
          {busy ? '处理中…' : done ? '✓ 已完成（点击取消）' : '○ 标记本日完成'}
        </View>

        <View className='section-head'>
          <View className='bar' />
          <Text className='title-text'>今日 20 词</Text>
        </View>
        <View className='word-list'>
          {day.words?.map((w, i) => (
            <View className='word-card' key={w.id}>
              <View className='word-top'>
                <Text className='word-seq'>{String(i + 1).padStart(2, '0')}</Text>
                <Text className='word-en'>{w.word}</Text>
                <Text className='word-pos'>{w.pos}</Text>
                {w.hasAudio ? (
                  <Text className='audio-btn' onClick={() => playAudio(w.id)}>
                    🔊
                  </Text>
                ) : null}
              </View>
              <Text className='word-meaning'>{w.meaning}</Text>
              <View className='example'>
                <Text className='example-en'>{w.exampleEn}</Text>
                <Text className='example-zh'>{w.exampleZh}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className='section-head spaced'>
          <View className='bar' />
          <Text className='title-text'>句子跟读</Text>
        </View>
        {day.words?.slice(0, 5).map((w) => (
          <View className='sentence' key={`s-${w.id}`}>
            <Text className='sentence-en'>{w.exampleEn}</Text>
            <Text className='sentence-zh'>{w.exampleZh}</Text>
          </View>
        ))}

        {unit ? (
          <>
            <View className='section-head spaced'>
              <View className='bar' />
              <Text className='title-text'>短文阅读</Text>
            </View>
            <View className='reading'>
              <Text className='reading-text'>{unit.intro}</Text>
              {day.words?.slice(0, 6).map((w) => (
                <Text className='reading-line' key={`r-${w.id}`}>{w.exampleEn}</Text>
              ))}
              <Text className='reading-text'>{unit.outro}</Text>
              <Text className='reading-zh'>{unit.introZh}</Text>
              <Text className='reading-zh'>{unit.outroZh}</Text>
            </View>
          </>
        ) : null}

        {globalDay % 10 === 0 ? (
          <View className='review-card'>
            <Text className='review-title'>周复习 · Day {globalDay}</Text>
            <Text className='review-desc'>每 10 天回顾一次，把短期记忆变成长期记忆。</Text>
          </View>
        ) : null}
        {(globalDay % 30 === 0 || globalDay === 200) ? (
          <View className='review-card monthly'>
            <Text className='review-title'>月总结 · Day {globalDay}</Text>
            <Text className='review-desc'>坚持一个月了，回顾这 30 天的积累吧。</Text>
          </View>
        ) : null}

        <View className='bottom-nav' onClick={() => goDay(globalDay + 1)}>
          {globalDay >= 200 ? '已是最后一天' : '下一天 ›'}
        </View>
      </View>
    </View>
  )
}
