// bookShelf.ts
import {
  IIntroPage,
  IIntroBookShelfData,
  File,
} from './../../utils/types';
import {
  storageKey,
} from './../../utils/config';
import {
  book,
} from './../../utils/base64';

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
    img: {
      book,
    },
    selectedIds: [],
    toppingIds: [],
  },
  onLoad() {
    this.getHistoryFile();
    this.getToppingFile();
  },
  // 获取历史文件
  getHistoryFile() {
    const tempFilesStr = wx.getStorageSync(storageKey.FILES);
    if (!tempFilesStr) return;
    // console.log("tempFilesStr", tempFilesStr);
    const tempFiles = JSON.parse(tempFilesStr) || [];
    console.log(tempFiles);
    this.setData({ tempFiles });
  },
  // 获取置顶文件
  getToppingFile() {
    const toppingIdsStr = wx.getStorageSync(storageKey.TOPPING);
    if (!toppingIdsStr) return;
    // console.log("toppingIdsStr", toppingIdsStr);
    const toppingIds = JSON.parse(toppingIdsStr) || [];
    console.log(toppingIds);
    this.setData({ toppingIds });
  },
  // 选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 9,
      success: (res) => {
        console.log(res);
        const newTempFiles = res.tempFiles.map((item, index) => {
          return {
            ...item,
            id: new Date().getTime() + '' + index,
          }
        })
        const tempFiles = Array.prototype.concat(this.data.tempFiles, newTempFiles);
        this.updateFiles(tempFiles);
      }
    })
  },
  // 更新文件列表 
  updateFiles(tempFiles: File[]) {
    this.setData({ tempFiles });
    wx.setStorageSync(storageKey.FILES, JSON.stringify(tempFiles));
  },
  // 更新置顶列表
  updateTopping(ToppingIds?: string[]) {
    const toppingIds = (ToppingIds || this.data.toppingIds).filter(toppingId => {
      return this.data.tempFiles.some(tempFile => tempFile.id === toppingId);
    });
    this.setData({ toppingIds });
    wx.setStorageSync(storageKey.TOPPING, JSON.stringify(toppingIds));
  },
  // 去详情
  toDetail(e: any) {
    // console.log(e);
    const dataset = e.currentTarget.dataset;
    if (this.data.settingFlag) {
      this.selectedToggle(dataset.bookitem.id);
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
          const id = e.currentTarget.dataset.bookitem.id;
          this.settingToggle(this.data.settingFlag);
          this.selectedToggle(id);
        }
      }
    });
  },
  // 书籍选中Toggle
  selectedToggle(id: string) {
    let selectedIds = this.data.selectedIds;
    const idx = selectedIds.findIndex(i => i === id);
    if (idx === -1) {
      selectedIds.push(id);
    } else {
      selectedIds.splice(idx, 1);
    }
    this.setData({ selectedIds });
  },
  // 书籍全选Toggle
  selectedAllToggle(selectAll: boolean) {
    this.setData({
      selectedIds: selectAll ? this.data.tempFiles.map(i => i.id) : [],
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
    const tempFiles = this.data.tempFiles.filter(i => {
      return Array.prototype.includes.call(this.data.selectedIds, i.id);
    });
    this.updateFiles(tempFiles);
    this.updateTopping();
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
  /**
   * 重命名
   */
  handleRename() {
    if (this.data.selectedIds.length !== 1) return;
    const id = this.data.selectedIds[0];
    const selected = (this.data.tempFiles.filter(i => i.id === id))[0];
    const content = selected.rename || selected.name
    wx.showModal({
      title: '重命名',
      editable: true,
      content,
      success: res => {
        if (res.confirm) {
          // console.log('用户点击确定', res);
          this.updateFiles(this.data.tempFiles.map(item => {
            if (item.id === selected.id) {
              return {
                ...item,
                rename: res.content,
              }
            }
            return item;
          }))
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 置顶、取消置顶
   * @param e 
   */
  handleToppingToggle(e: any) {
    const topping = e.currentTarget.dataset.topping;
    const toppingFlag = topping === "true";
    let toppingIds = this.data.toppingIds;
    if (toppingFlag) {
      toppingIds = Array.prototype.concat([], this.data.toppingIds, this.data.selectedIds);
      toppingIds = Array.from(new Set(toppingIds));
    } else {
      toppingIds = this.data.toppingIds.filter(id => {
        return !Array.prototype.includes.call(this.data.selectedIds, id);
      });
    };
    this.updateTopping(toppingIds);
  }
})
