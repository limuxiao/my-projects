import React, { useState } from 'react'
import { Text, View } from '@tarojs/components'
import { Button as NutButton, Input as NutInput } from '@nutui/nutui-react-taro'
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
            <NutInput
              className='field-input'
              type='number'
              value={phone}
              onChange={(v) => setPhone(String(v))}
              placeholder='请输入手机号'
              maxLength={11}
              clearable
              plain
            />
          </View>
          <View className='field'>
            <Text className='field-label'>密码</Text>
            <NutInput
              className='field-input'
              type='password'
              value={password}
              onChange={(v) => setPassword(String(v))}
              placeholder='至少 8 位'
              plain
            />
          </View>
          <View className='field'>
            <Text className='field-label'>昵称（选填）</Text>
            <NutInput
              className='field-input'
              value={nickname}
              onChange={(v) => setNickname(String(v))}
              placeholder='怎么称呼你'
              clearable
              plain
            />
          </View>

          {error ? <View className='error-bar'>{error}</View> : null}

          <NutButton
            className='submit'
            type='primary'
            color='#b8860b'
            shape='round'
            block
            loading={loading}
            disabled={loading}
            onClick={submit}
          >
            {loading ? '注册中…' : '注册'}
          </NutButton>
        </View>
      </View>
    </View>
  )
}
