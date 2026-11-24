import React, { useState } from 'react'
import { Text, View } from '@tarojs/components'
import { Button as NutButton, Input as NutInput } from '@nutui/nutui-react-taro'
import Taro, { useRouter } from '@tarojs/taro'
import { login } from '@/api/auth'
import { setSession } from '@/utils/auth'
import './index.scss'

export default function LoginPage() {
  const router = useRouter()
  const from = router.params.from || ''
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function backAfterLogin() {
    if (from === 'gold') {
      Taro.switchTab({ url: '/pages/gold/index' })
    } else if (from === 'home') {
      Taro.switchTab({ url: '/pages/home/index' })
    } else if (Taro.getCurrentPages().length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/home/index' })
    }
  }

  async function submit() {
    if (!phone.trim() || !password) {
      setError('请填写手机号和密码')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await login({ phone: phone.trim(), password })
      setSession(result.accessToken, result.user)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(backAfterLogin, 600)
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
        <View className='auth-title'>欢迎回来</View>
        <View className='auth-subtitle'>登录后使用黄金计算与英语学习计划</View>
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
              placeholder='请输入密码'
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
            {loading ? '登录中…' : '登录'}
          </NutButton>

          <View className='auth-footer' onClick={() => Taro.navigateTo({ url: '/pages/register/index' })}>
            还没有账户？<Text className='link'>去注册</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
