// pages/detail/detail.ts
import { getSetting, saveSetting } from "./../../utils/util";
import { TxtFileServices } from "./../../utils/txtFileServices";
import { SubFile, File } from "./../../utils/txtFileTypes";

interface IIntroPage {
  [key: string]: any;
}

interface IIntroData {
  loadingHidden: boolean;
  percent: number;
  file: File;
  // 文件或目录 路径必须使用 wx.env.USER_DATA_PATH 即时获取
  // 存入data就会有问题
  readInfoField: string;
  curChapter: number;
  subFile: SubFile[];
  idx: number;
  chapterArr: string[][];
  scrollTop: number;
  listScrollIntoView: string;
  theme: {
    text_bgc: string;
    text_font: string;
    list_bgc: string;
    list_border: string;
    list_font: string;
    list_cur_font: string;
    list_next_font: string;
  }[];
  settingFlag: boolean;
  settingDetailFlag: boolean;
  fontSizeMin: number;
  fontSizeMax: number;
  curTheme: number;
  fontSize: number;
  night: boolean;
  lineHeights: number[];
  lineHeightLevel: number;
  txtFileServ: TxtFileServices | null;
}

Page<IIntroData, IIntroPage>({
  /**
   * 页面的初始数据
   */
  data: {
    // 解析文件遮罩
    loadingHidden: true,
    // 解析文件进度
    percent: 0,
    // 源文件信息
    file: {
      name: "",
      size: 1,
      path: "",
      time: 111,
      type: "",
    },
    readInfoField: "/split_***",
    // 当前章节
    curChapter: 0,
    subFile: [],
    idx: 0,
    chapterArr: [[]],
    scrollTop: 0,
    listScrollIntoView: '',
    theme: [
      {
        text_bgc: "#D4E3D0",
        text_font: "#0D1C09",
        list_bgc: "#DDEBDA",
        list_border: "#DDEBDA",
        list_font: "#2F442A",
        list_cur_font: "#E29C3A",
        list_next_font: "#A4BBA1",
      },
    ],
    settingFlag: false,
    settingDetailFlag: false,
    fontSizeMin: 16,
    fontSizeMax: 72,
    curTheme: 0,
    fontSize: 48,
    night: false,
    lineHeights: [1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6],
    lineHeightLevel: 3,
    txtFileServ: null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(params) {
    console.log(params);
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on("bookItem", (data) => {
      console.log(data);
      // 查询本地 getStorageSync split + time
      // 以文件time做标识
      const { time, size } = data;
      const fileDir = `/file_${time}_${size}`;
      const splitPre = `/split_${time}_${size}_`;
      const fileInfoField = splitPre + "fileInfo";
      const readInfoField = splitPre + "readInfo";
      const setting = getSetting();
      const txtFileServ = new TxtFileServices({
        fileDir,
        splitPre,
        fileInfoField,
        updateProgress: (percent: number) => {
          this.setData({ percent });
        },
      });
      this.setData({
        readInfoField,
        txtFileServ,
        file: data,
        ...setting,
      });
      const curChapter = wx.getStorageSync(readInfoField);
      const subFileStr = wx.getStorageSync(fileInfoField);
      if (!!subFileStr) {
        const subFile = JSON.parse(subFileStr);
        // console.log(curChapter, subFileStr);
        this.setData({ subFile });
        this.jumpChapter(curChapter);
      } else {
        this.fileResolution();
      }
      // 存储章节分段文件路径
      // 当前所读章节 路径
    });
  },
  /**
   * 文件解析
   */
  fileResolution() {
    const { path } = this.data.file;
    this.setData({
      loadingHidden: false,
    });
    this.data.txtFileServ?.fileResolution(path).then(
      (subFile) => {
        this.setData({
          subFile,
          loadingHidden: true,
          curChapter: 0,
        });
        this.updateCurChapter();
        this.readChildFile();
      },
      () => {
        this.setData({
          loadingHidden: true,
        });
      }
    );
  },
  /**
   * 读取章节内容
   */
  readChildFile() {
    console.log(this.data.curChapter);
    console.log(this.data.subFile);
    this.data.txtFileServ
      ?.readChildFile(this.data.subFile, this.data.curChapter)
      .then(
        (res) => {
          console.log(res);
          this.setData(res);
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 300,
          });
        },
        (err) => {
          console.error(err);
        }
      );
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
        scrollTop: 0,
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
        scrollTop: 0,
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
      scrollTop: 0,
    });
    this.readChildFile();
    this.updateCurChapter();
  },
  /**
   * 更新当前所读章节数
   */
  updateCurChapter() {
    wx.setStorageSync(this.data.readInfoField, this.data.curChapter);
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
    const animation = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0,
    });
    animation.translateX(-150).step();
    this.setData({
      listAnimation: animation.export(),
    });
    setTimeout(() => {
      animation.translateX(0).step();
      this.setData({
        listAnimation: animation,
      });
      if (status == "close") {
        this.setData({
          listFlag: false,
        });
      }
    }, 100);
    if (status == "open") {
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
        listFlag: true,
        listScrollIntoView: 'list' + curChapter,
      });
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
   * 设置显隐click
   */
  handleSettingToggle() {
    this.settingToggle(this.data.settingFlag);
  },
  /**
   * 设置显隐
   */
  settingToggle(settingFlag: boolean) {
    const animation = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0,
    });
    animation.translateY(150).step();
    this.setData({
      settingAnimation: animation.export(),
    });
    if (!settingFlag) {
      this.setData({
        settingFlag: true,
      });
    }
    setTimeout(() => {
      animation.translateY(0).step();
      this.setData({
        settingAnimation: animation,
      });
      if (settingFlag) {
        this.setData({
          settingFlag: false,
        });
      }
    }, 100);
  },
  // 黑夜白天切换
  nightToggle() {
    this.setData({
      night: !this.data.night,
    });
    this.updateSetting();
  },
  // 字体大小滑轮
  fontSizeChange(e: any) {
    const { value } = e.detail;
    this.setData({ fontSize: value });
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
  // 更新设置
  updateSetting() {
    saveSetting({
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
});
