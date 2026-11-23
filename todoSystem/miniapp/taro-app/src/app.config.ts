export default {
  pages: [
    'pages/home/index',
    'pages/gold/index',
    'pages/me/index',
    'pages/login/index',
    'pages/register/index',
    'pages/study-day/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2c2416',
    navigationBarTitleText: 'todoSystem',
    navigationBarTextStyle: 'white',
    backgroundColor: '#faf7f0'
  },
  tabBar: {
    color: '#8a7d63',
    selectedColor: '#b8860b',
    backgroundColor: '#fffdf7',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/gold/index', text: '黄金' },
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/me/index', text: '我' }
    ]
  },
  style: 'v2',
  sitemapLocation: 'sitemap.json'
}
