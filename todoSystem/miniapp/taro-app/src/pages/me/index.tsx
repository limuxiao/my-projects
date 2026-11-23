import React, { useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import GuestGate from '@/components/GuestGate'
import { getMe } from '@/api/auth'
import { getToken, getUser, isLoggedIn, logout, setSession } from '@/utils/auth'
import type { User } from '@/types'
import './index.scss'

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function genderText(gender: User['gender']): string {
  if (gender === 'male') return '男'
  if (gender === 'female') return '女'
  return '未设置'
}

export default function MePage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useDidShow(() => {
    const ok = isLoggedIn()
    setLoggedIn(ok)
    if (!ok) {
      setUser(null)
      return
    }
    const cached = getUser()
    if (cached) setUser(cached)
    getMe()
      .then((fresh) => {
        setUser(fresh)
        const token = getToken()
        if (token) setSession(token, fresh)
      })
      .catch(() => {})
  })

  async function handleLogout() {
    const res = await Taro.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？'
    })
    if (!res.confirm) return
    logout()
    setLoggedIn(false)
    setUser(null)
    Taro.showToast({ title: '已退出登录', icon: 'success' })
    setTimeout(() => Taro.switchTab({ url: '/pages/home/index' }), 500)
  }

  if (!loggedIn || !user) {
    return (
      <View className='page'>
        <View className='hero-header'>
          <View className='hero-badge'>MY ACCOUNT</View>
          <View className='hero-title'>我</View>
          <View className='hero-subtitle'>登录以管理你的账号与学习进度</View>
        </View>
        <View className='wrap'>
          <GuestGate
            icon='👤'
            title='尚未登录'
            desc='登录后可查看个人信息、同步英语学习进度，并使用黄金加减仓计算。'
            ctaText='登录 / 注册'
            from='me'
          />
        </View>
      </View>
    )
  }

  const displayName = user.nickname || `用户 ${user.id}`
  const rows = [
    { label: '手机号', value: maskPhone(user.phone) },
    { label: '邮箱', value: user.email || '未设置' },
    { label: '性别', value: genderText(user.gender) },
    { label: '职业', value: user.occupation || '未设置' },
    { label: '角色', value: user.role === 'admin' ? '管理员' : '普通用户' },
    { label: '注册时间', value: user.createdAt ? user.createdAt.slice(0, 10) : '--' }
  ]

  return (
    <View className='page'>
      <View className='hero-header'>
        <View className='hero-badge'>MY ACCOUNT</View>
        <View className='hero-title'>我</View>
        <View className='hero-subtitle'>账号信息与学习数据</View>
      </View>

      <View className='wrap'>
        <View className='profile-card'>
          <View className='avatar'>{displayName.slice(0, 1)}</View>
          <View className='profile-main'>
            <View className='name-row'>
              <Text className='name'>{displayName}</Text>
              <Text className='vip'>LV.{user.vipLevel}</Text>
            </View>
            <Text className='sub'>{maskPhone(user.phone)}</Text>
          </View>
        </View>

        <View className='card'>
          <View className='card-title'>
            <View className='bar' />
            <Text className='title-text'>个人信息</Text>
          </View>
          {rows.map((row) => (
            <View className='info-row' key={row.label}>
              <Text className='info-label'>{row.label}</Text>
              <Text className='info-value'>{row.value}</Text>
            </View>
          ))}
        </View>

        <Button className='btn-ghost logout' onClick={handleLogout}>
          退出登录
        </Button>
      </View>
    </View>
  )
}
