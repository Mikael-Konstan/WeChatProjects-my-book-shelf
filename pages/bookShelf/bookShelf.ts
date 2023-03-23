// bookShelf.ts
import {
  IIntroPage,
  IIntroBookShelfData,
} from './../../utils/types';

Page<IIntroBookShelfData, IIntroPage>({
  data: {
    tempFiles: []
  },
  onLoad() {
    this.getHistoryFile();
  },
  // 获取历史文件
  getHistoryFile() {
    const tempFilesStr = wx.getStorageSync('tempFiles');
    if (!tempFilesStr) return;
    console.log("tempFilesStr", tempFilesStr);
    const tempFiles = JSON.parse(tempFilesStr) || [];
    console.log(tempFiles);
    this.setData({ tempFiles });
  },
  // 选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 9,
      success: (res) => {
        console.log(res);
        const tempFiles = Array.prototype.concat(this.data.tempFiles, res.tempFiles);
        this.setData({ tempFiles });
        wx.setStorageSync('tempFiles', JSON.stringify(tempFiles));
      }
    })
  },
  // 去详情
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
  },
  // 长按事件 删除书籍
  bindLongPress() {
    console.log('bindLongPress');
  }
})
