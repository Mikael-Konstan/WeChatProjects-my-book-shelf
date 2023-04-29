// index.ts
// 获取应用实例
const app = getApp<IAppOption>()

Page({
  data: {
    motto: 'Book Shelf',
  },
  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      // console.log("onShow 首页 1");
      this.getTabBar().setData({
        selected: 1,
      })
    };
  },
  // 事件处理函数
  toLogs() {
    console.log('bindViewTap');
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  toBookShelf() {
    console.log('toBookShelf');
    const url = '../bookShelf/bookShelf';
    wx.switchTab({
      url,
    })
  },
  toDemo() {
    console.log('toDemo');
    const url = '../demo/demo';
    // navigateBack
    wx.navigateTo({
      url,
    })
  },
  toSkill() {
    console.log('toSkill');
    const url = '../skill/skill';
    // redirectTo
    wx.reLaunch({
      url,
    })
  },
  toDrawer() {
    console.log('toDrawer');
    const url = '../drawer/drawer';
    // redirectTo
    wx.reLaunch({
      url,
    })
  },
})
