// custom-tab-bar/index.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    selected: 0,
    color: "#515151",
    selectedColor: "#09f",
    list: [{
      pagePath: "/pages/bookShelf/bookShelf",
      text: "书架",
      icon: "iconfont icon-bookShelf",
      selectedIcon: "iconfont icon-bookShelf-selected",
      iconPath: "/static/bookShelf.png",
      selectedIconPath: "/static/bookShelf_active.png"
    },
    {
      pagePath: "/pages/index/index",
      text: "我的",
      icon: "iconfont icon-my",
      selectedIcon: "iconfont icon-my-selected",
      iconPath: "/static/my.png",
      selectedIconPath: "/static/my_active.png"
    }
    ],
    // tabBar显隐flag
    tabBarFlag: false,
    tabBarAnimation: wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0,
    }).translateY(0).step(),
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e: any) {
      console.log("执行跳转", e);
      const dataset = e.currentTarget.dataset;
      wx.switchTab({
        url: dataset.path,
      });
    },
    /**
     * tabBar显隐
     */
    tabBarToggle(tabBarFlag: boolean) {
      const tabBarAnimation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0,
      });
      if (tabBarFlag) {
        tabBarAnimation.translateY(0).step();
      } else {
        tabBarAnimation.translateY(150).step();
      }
      this.setData({
        tabBarFlag: !tabBarFlag,
        tabBarAnimation,
      });
    },
  }
})
