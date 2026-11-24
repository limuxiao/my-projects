import React, { useMemo, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { Button as NutButton, Input as NutInput } from '@nutui/nutui-react-taro'
import { useDidShow } from '@tarojs/taro'
import GuestGate from '@/components/GuestGate'
import { isLoggedIn } from '@/utils/auth'
import { calc, fmt, fmtG, signed, type Mode } from '@/utils/calc'
import './index.scss'

interface DetailItem {
  key: string
  label: string
  value: string
  unit: string
  cls: string
}

export default function GoldPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [cost, setCost] = useState('')
  const [grams, setGrams] = useState('')
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<Mode>('add')

  useDidShow(() => setLoggedIn(isLoggedIn()))

  const result = useMemo(
    () =>
      calc({
        cost: parseFloat(cost),
        grams: parseFloat(grams),
        price: parseFloat(price),
        amount: parseFloat(amount),
        mode
      }),
    [cost, grams, price, amount, mode]
  )

  const isAdd = mode === 'add'
  const amountLabel = isAdd ? '加仓金额' : '减仓金额'
  const amountHint = isAdd ? '本次买入投入金额' : '本次卖出回收金额'
  const heroLabel = isAdd ? '加仓后成本均价' : '减仓后成本均价'
  const gramsK = isAdd ? '加仓后持有克数' : '减仓后持有克数'
  const deltaK = isAdd ? '均价变化' : '已实现盈亏'
  const detailTitle = isAdd ? '加仓后明细' : '减仓后明细'

  const deltaCls = !result.ok
    ? ''
    : isAdd
      ? result.delta < 0 ? 'pos' : result.delta > 0 ? 'neg' : ''
      : result.delta > 0 ? 'pos' : result.delta < 0 ? 'neg' : ''

  const details: DetailItem[] = result.ok
    ? [
        { key: 'c1', label: '持仓成本', value: fmt(result.newTotalCost), unit: '元', cls: '' },
        { key: 'c2', label: '当前市值', value: fmt(result.newMarketValue), unit: '元', cls: '' },
        {
          key: 'c3',
          label: '浮动盈亏',
          value: signed(result.newFloatPL),
          unit: '元',
          cls: result.newFloatPL > 0 ? 'pos' : result.newFloatPL < 0 ? 'neg' : ''
        },
        {
          key: 'c4',
          label: '收益率',
          value: `${signed(result.newRate)}%`,
          unit: '',
          cls: result.newRate > 0 ? 'pos' : result.newRate < 0 ? 'neg' : ''
        },
        { key: 'c5', label: result.extra1Label, value: fmtG(result.extra1Val), unit: 'g', cls: '' },
        {
          key: 'c6',
          label: result.extra2Label,
          value: isAdd ? fmt(result.extra2Val) : signed(result.extra2Val),
          unit: '元',
          cls: isAdd ? '' : result.extra2Val > 0 ? 'pos' : result.extra2Val < 0 ? 'neg' : ''
        }
      ]
    : []

  function fillExample() {
    setCost('480')
    setGrams('100')
    setPrice('560')
    setAmount('10000')
  }

  if (!loggedIn) {
    return (
      <View className='page'>
        <View className='hero-header'>
          <View className='hero-badge'>GOLD CALCULATOR</View>
          <View className='hero-title'>黄金持仓计算器</View>
          <View className='hero-subtitle'>加仓 / 减仓后的成本均价与收益测算</View>
        </View>
        <View className='wrap'>
          <GuestGate
            icon='📈'
            title='登录后开始测算'
            desc='黄金加减仓计算属于核心功能，请先登录账号。登录后可随时测算加仓摊薄均价与减仓收益。'
            ctaText='去登录'
            from='gold'
          />
          <View className='note'>
            计算说明：加仓按「金额 ÷ 现价」折算新增克数，新旧成本合并后摊薄均价；减仓按「金额 ÷ 现价」折算卖出克数，采用平均成本法结转已实现盈亏。结果未计入手续费、点差及税费，仅供参考。
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='page'>
      <View className='hero-header'>
        <View className='hero-badge'>GOLD CALCULATOR</View>
        <View className='hero-title'>黄金持仓计算器</View>
        <View className='hero-subtitle'>加仓 / 减仓后的成本均价与收益测算</View>
      </View>

      <View className='wrap'>
        <View className='card'>
          <View className='card-title'>
            <View className='bar' />
            <Text className='title-text'>持仓信息</Text>
          </View>

          <View className='field'>
            <View className='field-label'>
              <Text>原成本均价</Text>
              <Text className='hint'>买入时的平均成本</Text>
            </View>
            <View className='input-box'>
              <NutInput
                className='gold-field'
                type='digit'
                value={cost}
                onChange={(v) => setCost(String(v))}
                placeholder='例如 480'
              />
              <Text className='suffix'>元/g</Text>
            </View>
          </View>

          <View className='field'>
            <View className='field-label'>
              <Text>当前持有克数</Text>
              <Text className='hint'>操作前的持仓</Text>
            </View>
            <View className='input-box'>
              <NutInput
                className='gold-field'
                type='digit'
                value={grams}
                onChange={(v) => setGrams(String(v))}
                placeholder='例如 100'
              />
              <Text className='suffix'>g</Text>
            </View>
          </View>

          <View className='field'>
            <View className='field-label'>
              <Text>现黄金价格</Text>
              <Text className='hint'>当前成交/参考价</Text>
            </View>
            <View className='input-box'>
              <NutInput
                className='gold-field'
                type='digit'
                value={price}
                onChange={(v) => setPrice(String(v))}
                placeholder='例如 560'
              />
              <Text className='suffix'>元/g</Text>
            </View>
          </View>
        </View>

        <View className='card'>
          <View className='card-title'>
            <View className='bar' />
            <Text className='title-text'>操作设置</Text>
            <NutButton className='example' type='primary' color='#b8860b' fill='outline' size='mini' onClick={fillExample}>
              填入示例
            </NutButton>
          </View>

          <View className='segment'>
            <NutButton
              className='segment-btn'
              type={isAdd ? 'primary' : 'default'}
              color={isAdd ? '#b8860b' : undefined}
              shape='round'
              onClick={() => setMode('add')}
            >
              加仓（买入）
            </NutButton>
            <NutButton
              className='segment-btn'
              type={!isAdd ? 'primary' : 'default'}
              color={!isAdd ? '#b8860b' : undefined}
              shape='round'
              onClick={() => setMode('sell')}
            >
              减仓（卖出）
            </NutButton>
          </View>

          <View className='field'>
            <View className='field-label'>
              <Text>{amountLabel}</Text>
              <Text className='hint'>{amountHint}</Text>
            </View>
            <View className='input-box'>
              <NutInput
                className='gold-field'
                type='digit'
                value={amount}
                onChange={(v) => setAmount(String(v))}
                placeholder='例如 10000'
              />
              <Text className='suffix'>元</Text>
            </View>
          </View>

          <View className='warning'>{result.ok ? '' : result.warning || ''}</View>
        </View>

        <View className='hero'>
          <View className='hero-label'>{heroLabel}</View>
          <View className='hero-big'>
            {result.ok ? fmt(result.newCostAvg) : '--'}
            <Text className='hero-unit'>元/g</Text>
          </View>
          <View className='hero-sub'>
            {result.ok
              ? result.heroSub
              : result.error || '请完整填写上方数据（数值需大于 0）'}
          </View>
          <View className='stats'>
            <View className='stat'>
              <View className='stat-k'>{gramsK}</View>
              <View className='stat-v'>
                {result.ok ? fmtG(result.newGrams) : '--'} <Text className='mini'>g</Text>
              </View>
            </View>
            <View className='stat'>
              <View className='stat-k'>{deltaK}</View>
              <View className={`stat-v ${deltaCls}`}>
                {result.ok ? `${signed(result.delta)}${isAdd ? ' 元/g' : ' 元'}` : '--'}
              </View>
            </View>
          </View>
        </View>

        <View className='card'>
          <View className='card-title'>
            <View className='bar' />
            <Text className='title-text'>{detailTitle}</Text>
          </View>
          <View className='grid'>
            {details.map((item, index) => (
              <View key={item.key} className={`cell ${index % 2 === 1 ? 'last' : ''}`}>
                <View className='cell-k'>{item.label}</View>
                <View className={`cell-v ${item.cls}`}>
                  {item.value}
                  {item.unit ? <Text className='cell-unit'>{item.unit}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className='note'>
          计算说明：加仓按「金额 ÷ 现价」折算新增克数，新旧成本合并后摊薄均价；减仓按「金额 ÷ 现价」折算卖出克数，采用平均成本法结转已实现盈亏，剩余持仓的成本均价保持不变。结果未计入手续费、点差及税费，仅供参考。
        </View>
      </View>
    </View>
  )
}
