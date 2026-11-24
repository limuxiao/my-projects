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
    navigationStyle: 'custom',
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
      {
        pagePath: 'pages/gold/index',
        text: '黄金',
        iconPath: 'assets/tabbar/gold_normal.png',
        selectedIconPath: 'assets/tabbar/gold_active.png'
      },
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tabbar/home_normal.png',
        selectedIconPath: 'assets/tabbar/home_active.png'
      },
      {
        pagePath: 'pages/me/index',
        text: '我',
        iconPath: 'assets/tabbar/me_normal.png',
        selectedIconPath: 'assets/tabbar/me_active.png'
      }
    ]
  },
  style: 'v2',
  sitemapLocation: 'sitemap.json'
}
