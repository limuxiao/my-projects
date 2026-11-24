import React from 'react'
import { Text, View } from '@tarojs/components'
import { Button as NutButton } from '@nutui/nutui-react-taro'
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
      <NutButton
        type='primary'
        color='#b8860b'
        shape='round'
        block
        onClick={() => goLogin(from)}
      >
        {ctaText}
      </NutButton>
    </View>
  )
}
