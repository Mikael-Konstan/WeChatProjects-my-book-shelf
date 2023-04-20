// bookShelf.ts
import {
  IIntroPage,
  IIntroBookShelfData,
  File,
} from './../../utils/types';

Page<IIntroBookShelfData, IIntroPage>({
  data: {
    tempFiles: [],
    // 设置显隐flag
    settingFlag: false,
    settingAnimation: wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0,
    }).translateY(150).step(),
    bgcImg: '/static/book.png',
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
        this.updateFiles(tempFiles);
      }
    })
  },
  // 更新文件列表 
  updateFiles(tempFiles: File[]) {
    this.setData({ tempFiles });
    wx.setStorageSync('tempFiles', JSON.stringify(tempFiles));
  },
  // 去详情
  toDetail(e: any) {
    // console.log(e);
    const dataset = e.currentTarget.dataset;
    if (this.data.settingFlag) {
      this.selectedToggle(dataset.index);
      return;
    }
    wx.navigateTo({
      url: '../detail/detail?test=TEST',
      success: function (res) {
        // 通过 eventChannel 向被打开页面传送数据
        res.eventChannel.emit('bookItem', dataset.bookitem)
      }
    })
  },
  // 长按事件 显示设置栏
  bindLongPress(e: any) {
    console.log('bindLongPress');
    wx.hideTabBar({
      success: () => {
        // console.log('success');
        if (!this.data.settingFlag) {
          const index = e.currentTarget.dataset.index;
          this.settingToggle(this.data.settingFlag);
          this.selectedToggle(index);
        }
      }
    });
  },
  // 书籍选中Toggle
  selectedToggle(index: number) {
    const tempFiles = this.data.tempFiles;
    tempFiles[index].selected = !tempFiles[index].selected;
    this.setData({ tempFiles });
  },
  // 书籍全选Toggle
  selectedAllToggle(selected: boolean) {
    this.setData({
      tempFiles: this.data.tempFiles.map(i => {
        i.selected = selected;
        return i
      })
    });
  },
  /**
   * 隐藏设置栏
   */
  handleHideSetting() {
    this.settingToggle(this.data.settingFlag);
    setTimeout(() => {
      wx.showTabBar({
        fail: () => {
          this.settingToggle(this.data.settingFlag);
        }
      });
    }, 300);
  },
  /**
   * 删除选中书籍
   */
  handleDelete() {
    const tempFiles = this.data.tempFiles.filter(i => !i.selected);
    this.updateFiles(tempFiles);
  },
  /**
   * 设置显隐
   */
  settingToggle(settingFlag: boolean) {
    const settingAnimation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0,
    });
    if (settingFlag) {
      settingAnimation.translateY(150).step();
    } else {
      settingAnimation.translateY(0).step();
      this.selectedAllToggle(false);
    }
    this.setData({
      settingFlag: !settingFlag,
      settingAnimation,
    });
  },
})
