import React, { useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { register } from '@/api/auth'
import './index.scss'

export default function RegisterPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!phone.trim() || !password) {
      setError('请填写手机号和密码')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register({
        phone: phone.trim(),
        password,
        ...(nickname.trim() ? { nickname: nickname.trim() } : {})
      })
      Taro.showToast({ title: '注册成功，请登录', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 600)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='page'>
      <View className='auth-hero'>
        <View className='auth-logo'>TODO</View>
        <View className='auth-title'>创建账户</View>
        <View className='auth-subtitle'>注册后即可同步学习进度</View>
      </View>

      <View className='wrap'>
        <View className='card'>
          <View className='field'>
            <Text className='field-label'>手机号</Text>
            <Input
              className='field-input'
              type='number'
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
              placeholder='请输入手机号'
              placeholderClass='ph'
              maxlength={11}
            />
          </View>
          <View className='field'>
            <Text className='field-label'>密码</Text>
            <Input
              className='field-input'
              password
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
              placeholder='至少 8 位'
              placeholderClass='ph'
            />
          </View>
          <View className='field'>
            <Text className='field-label'>昵称（选填）</Text>
            <Input
              className='field-input'
              value={nickname}
              onInput={(e) => setNickname(e.detail.value)}
              placeholder='怎么称呼你'
              placeholderClass='ph'
            />
          </View>

          {error ? <View className='error-bar'>{error}</View> : null}

          <Button className='btn-primary submit' disabled={loading} onClick={submit}>
            {loading ? '注册中…' : '注册'}
          </Button>
        </View>
      </View>
    </View>
  )
}
