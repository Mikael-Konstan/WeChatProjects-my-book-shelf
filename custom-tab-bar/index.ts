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
    "color": "#515151",
    "selectedColor": "#09f",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    list: [{
      "pagePath": "/pages/bookShelf/bookShelf",
      "text": "书架",
      "iconPath": "/static/bookShelf.png",
      "selectedIconPath": "/static/bookShelf_active.png"
    },
    {
      "pagePath": "/pages/index/index",
      "text": "我的",
      "iconPath": "/static/my.png",
      "selectedIconPath": "/static/my_active.png"
    }]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e: any) {
      console.log("执行跳转", e);
      // TOFIX 跳转时偶现重载
      const dataset = e.currentTarget.dataset;
      this.setData({ selected: dataset.index });
      wx.switchTab({
        url: dataset.path,
      });
      console.log(dataset);
    }
  }
})
