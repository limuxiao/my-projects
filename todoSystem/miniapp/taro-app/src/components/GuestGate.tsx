import React from 'react'
import { Button, Text, View } from '@tarojs/components'
import { goLogin } from '@/utils/auth'

interface Props {
  icon?: string
  title: string
  desc: string
  ctaText?: string
  from?: string
}

export default function GuestGate({
  icon = '🔒',
  title,
  desc,
  ctaText = '登录后使用',
  from
}: Props) {
  return (
    <View className='guest-card'>
      <View className='guest-icon'>{icon}</View>
      <View className='guest-title'>{title}</View>
      <Text className='guest-desc'>{desc}</Text>
      <Button className='btn-primary' onClick={() => goLogin(from)}>
        {ctaText}
      </Button>
    </View>
  )
}
