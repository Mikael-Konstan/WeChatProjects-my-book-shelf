// custom-tab-bar/index.ts
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
        "pagePath": "pages/bookShelf/bookShelf",
        "text": "书架",
        "iconPath": "/static/bookShelf.png",
        "selectedIconPath": "/static/bookShelf_active.png"
      },
      {
        "pagePath": "pages/demo/demo",
        "text": "我的",
        "iconPath": "/static/my.png",
        "selectedIconPath": "/static/my_active.png"
      }
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e) {
      console.log("执行跳转", e);
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({
        url
      })
      this.setData({
        selected: data.index
      })
    }
  }
})