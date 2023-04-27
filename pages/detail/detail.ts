// pages/detail/detail.ts
import { TxtFileServices } from "./../../utils/txtFileServices";
import settingServ from './../../utils/settingServices';
import { ReadInfoServices } from './../../utils/readInfoServices';
import { ReadInfo } from './../../utils/readInfoTypes';
import {
  colorTheme,
  lineHeights,
} from './../../utils/config';
import {
  IIntroPage,
  IIntroDetailData,
  File,
} from './../../utils/types';

const app = getApp();

Page<IIntroDetailData, IIntroPage>({
  /**
   * 页面的初始数据
   */
  data: {
    img: {},
    // 解析文件遮罩
    loadingHidden: true,
    // 解析文件进度
    percent: 0,
    // 源文件信息
    file: {
      id: '',
      name: "",
      size: 1,
      path: "",
      time: 111,
      type: "",
    },
    // 当前章节
    curChapter: 0,
    // 章节与所在缓存文件映射
    subFile: [],
    idx: 0,
    // 目录信息
    chapterArr: [[]],
    // 阅读进度百分比
    readPercent: 0,
    scrollTop: 0,
    listAnimation: wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0,
    }).translateX(-wx.getWindowInfo().screenWidth).step(),
    // 目录 锚点滚动到当前章节
    listScrollIntoView: '',
    theme: colorTheme,
    // 设置显隐flag
    settingFlag: false,
    settingAnimation: wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0,
    }).translateY(150).step(),
    // 设置详情显隐flag
    settingDetailFlag: false,
    fontSizeMin: 16,
    fontSizeMax: 72,
    // 之前的主题
    oldTheme: 1,
    // 当前主题
    curTheme: 1,
    // 字体大小
    fontSize: 48,
    // 黑夜模式
    night: false,
    // 行间距等级
    lineHeightLevel: 3,
    lineHeights,
    // 文件服务
    txtFileServ: null,
    // 文件阅读信息
    readInfoServ: null,
    timer: 0,
    // 翻页时滚动距离
    pageHeight: 0,
    renderLineHeight: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.log('onLoad');
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("bookItem", (data: File) => {
      console.log(data);
      this.dataInit(data);
      this.getHeightOfScroll();
    });
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('onUnload');
    this.data.readInfoServ?.setReadInfo({ scrollTop: this.data.scrollTop });
  },
  /**
   * data & services初始化
   * @param data any
   */
  dataInit(data: File) {
    // 以文件time & size做标识
    const { time, size } = data;
    const fileDir = `/file_${time}_${size}`;
    const splitPre = `/split_${time}_${size}_`;
    const fileInfoField = splitPre + "fileInfo";
    const readInfoServ = new ReadInfoServices(splitPre + "readInfo");
    // 阅读信息(进度)
    const readInfo = readInfoServ.getReadInfo();
    // 阅读设置(主题)
    const setting = settingServ.getSetting();
    // 文件服务(文件读取、分块)
    const txtFileServ = new TxtFileServices({
      fileDir,
      splitPre,
      fileInfoField,
      regIdx: readInfo.regIdx,
      updateProgress: (percent: number) => {
        this.setData({ percent });
      },
      updateRegIdx: (regIdx: number) => {
        readInfoServ.setReadInfo({ regIdx });
      },
    });

    // 自定义导航栏大小、位置计算所需数据
    console.log(app.globalData);
    
    this.setData({
      txtFileServ,
      readInfoServ,
      file: data,
      ...readInfo,
      ...setting,
      globalData: app.globalData,
    });

    this.readInit(fileInfoField, readInfo);
  },
  /**
   * 阅读内容init
   */
  readInit(fileInfoField: string, readInfo: ReadInfo) {
    const subFileStr = wx.getStorageSync(fileInfoField);
    if (!!subFileStr) {
      const subFile = JSON.parse(subFileStr);
      // console.log(curChapter, subFileStr);
      this.setData({ subFile });
      this.jumpChapter(readInfo.curChapter);
      this.updatePercent();
    } else {
      this.fileResolution();
    }

    // 页面滚动到上次阅读位置
    setTimeout(() => {
      this.setData({
        scrollTop: readInfo.scrollTop,
      });
    }, 300);
  },
  /**
   * 获取页面内容高度、文字行高 点击滚动翻页所用
   */
  getHeightOfScroll() {
    const query = wx.createSelectorQuery()
    query.select('#detail').boundingClientRect((res) => {
      this.setData({
        pageHeight: res.height,
      })
    })
    query.select('#render-line-height').boundingClientRect((res) => {
      this.setData({
        renderLineHeight: res.height,
      })
    })
    query.exec();
  },
  /**
   * 文件解析
   */
  fileResolution() {
    const { path } = this.data.file;
    this.setData({
      loadingHidden: false,
    });
    // 重新解析文件 跳到之前阅读的章节
    const reParseFile = this.data.curChapter !== 0 && this.data.curChapter < this.data.subFile.length;
    let curChapter = 0;
    let chapterName = '';
    if (reParseFile) {
      chapterName = this.data.subFile[this.data.curChapter].chapterName;
    }

    this.data.txtFileServ?.fileResolution(path).then(
      (subFile) => {
        if (reParseFile) {
          curChapter = this.data.subFile.findIndex(i => i.chapterName === chapterName);
        }
        this.setData({
          subFile,
          loadingHidden: true,
          curChapter,
        });
        this.updateCurChapter();
        this.readChildFile();
      },
      () => {
        this.setData({
          loadingHidden: true,
        });
        wx.showToast({
          title: '找不到资源',
          icon: 'error',
          duration: 3000,
          mask: true,
          fail: () => {
            wx.navigateBack({ delta: 1 });
          }
        })

      }
    );
  },
  /**
   * 读取章节内容
   */
  readChildFile() {
    // console.log(this.data.curChapter);
    // console.log(this.data.subFile);
    this.data.txtFileServ
      ?.readChildFile(this.data.subFile, this.data.curChapter)
      .then(
        (res) => {
          console.log(res);
          this.setData({
            ...res,
            scrollTop: 0,
          });
        },
        (err) => {
          console.error(err);
        }
      );
  },
  /**
   * 监听页面滚动
   * @param e any
   */
  handleOnScroll(e: any) {
    // console.log('handleOnScroll', e);
    clearTimeout(this.data.timer);
    const timer = setTimeout(() => {
      this.setData({
        scrollTop: e.detail.scrollTop,
      });
    }, 600);
    this.setData({
      timer,
    });
  },
  /**
   * 上一章
   */
  previousChapter() {
    // console.log('previousChapter');
    if (this.data.curChapter === 0) return;
    // 缓存中的第一章
    if (this.data.idx === 0) {
      this.setData({
        curChapter: this.data.curChapter - 1,
      });
      this.readChildFile();
    } else {
      this.setData({
        idx: this.data.idx - 1,
        curChapter: this.data.curChapter - 1,
        scrollTop: 0,
      });
    }

    this.updateCurChapter();
  },
  /**
   * 下一章
   */
  nextChapter() {
    // console.log('nextChapter');
    const len = this.data.subFile.length - 1;
    if (this.data.curChapter === len) return;
    // 缓存中的最后一章
    if (this.data.idx === this.data.chapterArr.length - 1) {
      this.setData({
        curChapter: this.data.curChapter + 1,
      });
      this.readChildFile();
    } else {
      this.setData({
        idx: this.data.idx + 1,
        curChapter: this.data.curChapter + 1,
        scrollTop: 0,
      });
    }

    this.updateCurChapter();
  },
  /**
   * 跳到某一章
   */
  jumpChapter(curChapter: number) {
    this.setData({
      curChapter,
    });
    this.readChildFile();
    this.updateCurChapter();
  },
  /**
   * 更新当前所读章节数
   */
  updateCurChapter() {
    this.data.readInfoServ?.setReadInfo({
      curChapter: this.data.curChapter
    });
    wx.setNavigationBarTitle({
      title: this.data.subFile[this.data.curChapter].chapterName,
    });
    this.updatePercent();
  },
  /**
   * 目录列表显隐click
   */
  handleListToggle(e: any) {
    const status = e.currentTarget.dataset.status;
    this.listToggle(status);
    if (status === "open") {
      this.settingToggle(true);
    }
  },
  /**
   * 目录列表显隐
   */
  listToggle(status: string) {
    const listFlag = status === 'open';
    const listAnimation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0,
    });
    if (listFlag) {
      listAnimation.translateX(0).step();
    } else {
      listAnimation.translateX(-wx.getWindowInfo().screenWidth).step();
    }
    this.setData({
      listAnimation,
    });
    if (listFlag) {
      this.handleListScrollCur();
    }
  },
  /**
   * 跳到某一章click
   */
  handleJumpChapter(e: any) {
    const chapter = e.currentTarget.dataset.chapter;
    this.jumpChapter(chapter);
    this.listToggle("close");
  },
  /**
   * 目录列表 锚点滚动
   */
  handleListScroll(e: any) {
    const anchor = e.currentTarget.dataset.anchor;
    this.setData({
      listScrollIntoView: anchor,
    });
  },
  /**
   * 目录列表 锚点滚动到当前章节
   */
  handleListScrollCur() {
    // 往下显示八章 显示在中间
    let curChapter = this.data.curChapter;
    for (let i = 3; i > 0; i--) {
      if (curChapter > 0) {
        curChapter--
      } else {
        break;
      }
    }
    this.setData({
      listScrollIntoView: 'list' + curChapter,
    });
  },
  /**
   * 设置显隐click
   */
  handleSettingToggle(e: any) {
    // console.log('handleSettingToggle', e.detail);
    if (!this.data.settingFlag) {
      this.updatePercent();
    } else {
      this.settingToggle(this.data.settingFlag);
      return;
    }
    const query = wx.createSelectorQuery()
    query.select('#detail').boundingClientRect((res) => {
      const { x, y } = e.detail;
      const { width, height } = res;
      // console.log(x, y, width, height);
      if (x < width * 0.3) {
        // 左边
        if (y < height * 0.7) {
          // 左上 -- 上一页
          this.previousPage();
        } else {
          // 左下 -- 下一页
          this.nextPage();
        }
      } else if (x < width * 0.7) {
        // 中部
        if (y < height * 0.3) {
          // 中上 -- 上一页
          this.previousPage();
        } else if (y < height * 0.7) {
          // 中间 -- 设置栏显隐
          this.settingToggle(this.data.settingFlag);
        } else {
          // 中下 -- 下一页
          this.nextPage();
        }
      } else {
        // 右边
        if (y < height * 0.3) {
          // 右上 -- 上一页
          this.previousPage();
        } else {
          // 右下 -- 下一页
          this.nextPage();
        }
      }
    })
    query.exec();
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
    }
    this.setData({
      settingFlag: !settingFlag,
      settingDetailFlag: false,
      settingAnimation,
    });
  },
  // 黑夜白天切换
  nightToggle() {
    const night = !this.data.night;
    this.setData({
      night,
      curTheme: night ? 0 : this.data.oldTheme,
    });
    this.updateSetting();
  },
  // 字体大小滑轮
  fontSizeChange(e: any) {
    const { value } = e.detail;
    this.setData({ fontSize: value });
    this.updateSetting();
  },
  // 字体大小
  handleFontSize(e: any) {
    const status = e.currentTarget.dataset.status;
    let fontSize = this.data.fontSize;
    if (status) {
      if (fontSize !== this.data.fontSizeMax) {
        fontSize += 2;
      }
    } else {
      if (fontSize !== this.data.fontSizeMin) {
        fontSize -= 2;
      }
    }
    this.setData({ fontSize });
    this.updateSetting();
  },
  // 行间距等级 滑轮
  lineHeightChange(e: any) {
    const { value } = e.detail;
    this.setData({ lineHeightLevel: value });
    this.updateSetting();
  },
  // 行间距等级
  handleLineHeight(e: any) {
    const status = e.currentTarget.dataset.status;
    let lineHeightLevel = this.data.lineHeightLevel;
    if (status) {
      if (lineHeightLevel !== this.data.lineHeights.length) {
        lineHeightLevel++;
      }
    } else {
      if (lineHeightLevel !== 1) {
        lineHeightLevel--;
      }
    }
    this.setData({ lineHeightLevel });
    this.updateSetting();
  },
  // 主题颜色
  handleThemeColor(e: any) {
    const curTheme = e.currentTarget.dataset.curtheme;
    this.setData({ curTheme, oldTheme: curTheme, night: false });
    this.updateSetting();
  },
  // 更新设置
  updateSetting() {
    settingServ.setSetting({
      oldTheme: this.data.oldTheme,
      curTheme: this.data.curTheme,
      night: this.data.night,
      fontSize: this.data.fontSize,
      lineHeightLevel: this.data.lineHeightLevel,
    });
  },
  // 详细设置
  settingDetailToggle() {
    this.setData({
      settingDetailFlag: !this.data.settingDetailFlag,
    });
  },
  // 获取阅读进度
  updatePercent() {
    const readPercent = parseInt(((this.data.curChapter / this.data.subFile.length) * 100) + '')
    this.setData({
      readPercent,
    })
  },
  // 上一页
  previousPage() {
    // console.log('previousPage', this.data.scrollTop);
    if (this.data.scrollTop === 0) {
      this.previousChapter();
      return;
    }
    this.setData({
      scrollTop: this.getScrollTop(false),
    });
  },
  // 下一页
  nextPage() {
    // console.log('nextPage', this.data.scrollTop);
    const query = wx.createSelectorQuery()
    query.select('#content-btn').boundingClientRect((res) => {
      // console.log(res.top);
      // console.log(this.data.pageHeight);
      if (res.top <= this.data.pageHeight) {
        this.nextChapter();
        return;
      }
      this.setData({
        scrollTop: this.getScrollTop(true),
      });
    })
    query.exec();
  },
  // 计算scrollTop
  getScrollTop(flag: boolean) {
    let scrollTop = this.data.scrollTop;
    if (flag) {
      scrollTop += this.data.pageHeight;
    } else {
      scrollTop -= this.data.pageHeight;
    }

    if (scrollTop < 0) return 0;

    const num = parseInt(scrollTop / this.data.renderLineHeight + '');
    return this.data.renderLineHeight * num;
  },
  // 返回
  handleBack() {
    wx.navigateBack({ delta: 1 });
  },
});
