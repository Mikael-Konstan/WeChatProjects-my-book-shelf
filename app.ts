// app.ts
App<IAppOption>({
  globalData: {
    navBarHeight: 0, // 导航栏高度
    menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
    menuBotton: 0, // 胶囊距底部间距（保持底部间距一致）
    menuHeight: 0, // 胶囊高度（自定义内容可与胶囊高度保证一致）
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })

    // 自定义导航栏大小、位置计算所需数据
    const getCustomNavigationInfo = () => {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync();
      // 胶囊按钮位置信息
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      // 导航栏高度 = 状态栏高度 + 44
      this.globalData.navBarHeight = systemInfo.statusBarHeight + 44;
      this.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
      this.globalData.menuBotton = menuButtonInfo.top - systemInfo.statusBarHeight;
      this.globalData.menuHeight = menuButtonInfo.height;
    }

    getCustomNavigationInfo();
  },

})