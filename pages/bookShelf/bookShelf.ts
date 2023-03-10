// bookShelf.ts
// const util = require('../../utils/util.js')

Page({
  data: {
    tempFiles: []
  },
  onLoad() {
    this.getHistoryFile();
  },
  getHistoryFile() {
    const tempFilesStr = wx.getStorageSync('tempFiles');
    if (!tempFilesStr) return;
    console.log("tempFilesStr", tempFilesStr);
    const tempFiles = JSON.parse(tempFilesStr) || [];
    console.log(tempFiles);
    this.setData({
      tempFiles: tempFiles as any,
    })
  },
  chooseFile() {
    wx.chooseMessageFile({
      count: 9,
      success: (res) => {
        console.log(res);
        const tempFiles = res.tempFiles;
        const files = Array.prototype.concat(this.data.tempFiles, tempFiles);
        this.setData({
          tempFiles: files as any,
        })
        wx.setStorageSync('tempFiles', JSON.stringify(files))
      }
    })
  },
  toDetail(e: any) {
    console.log(e);
    const dataset = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../detail/detail?test=TEST',
      success: function(res) {
        // 通过 eventChannel 向被打开页面传送数据
        res.eventChannel.emit('bookItem', dataset.bookitem)
      }
    })
  }
})
