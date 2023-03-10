// pages/detail/detail.ts
import { getSetting, saveSetting } from './../../utils/util';

interface SubFile {
  chapterName: string; // 章节名称
  fileName: string; // 文件名称
}
Page({
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
      name: '',
      size: 1,
      path: '',
      time: 111,
      type: '',
    },
    // 换行分隔符
    separator: '\n',
    divider: 'separatorDivider',
    // 文件或目录 路径必须使用 wx.env.USER_DATA_PATH 获取
    // 存入data就会有问题
    // 缓存文件目录名称
    fileDir: '/file_***',
    // 缓存文件名称前缀
    splitPre: '/split_***',
    // 缓存文件路径 storage存储字段
    fileInfoField: '/split_***',
    // 当前章节信息 storage存储字段
    readInfoField: '/split_***',
    // 当前章节
    curChapter: 0,
    // 多少章一个缓存文件
    num: 10,
    subFile: [],
    idx: 0,
    chapterArr: [['']],
    scrollTop: 0,
    listScrollTop: 0,
    theme: [
      {
        text_bgc: '#D4E3D0',
        text_font: '#0D1C09',
        list_bgc: '#DDEBDA',
        list_border: '#DDEBDA',
        list_font: '#2F442A',
        list_cur_font: '#E29C3A',
        list_next_font: '#A4BBA1',
      }
    ],
    settingFlag: false,
    settingDetailFlag: false,
    fontSizeMin: 16,
    fontSizeMax: 72,
    curTheme: 0,
    fontSize: 32,
    night: false,
    lineHeights: [1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6],
    lineHeightLevel: 3,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(params) {
    console.log(params);
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('bookItem', (data) => {
      console.log(data);
      // 查询本地 getStorageSync split + time
      // 以文件time做标识
      const { time, size } = data;
      const fileDir = `/file_${time}_${size}`;
      const splitPre = `/split_${time}_${size}_`;
      const fileInfoField = splitPre + 'fileInfo';
      const readInfoField = splitPre + 'readInfo';
      const setting = getSetting();
      this.setData({
        fileDir,
        splitPre,
        fileInfoField,
        readInfoField,
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
    })
  },
  /**
   * 文件解析
   */
  fileResolution() {
    const { path } = this.data.file;
    this.setData({
      loadingHidden: false
    });
    const fs = wx.getFileSystemManager();
    fs.readFile({
      filePath: path,
      encoding: 'utf-8',
      success: res => {
        // 创建缓存文件父级目录
        this.createParentDir(fs);
        // 创建缓存分块的子文件
        const subFile = this.createChildFiles(fs, res.data + '');
        const curChapter = 0;
        console.log('setStorageSync', subFile);
        this.setData({
          loadingHidden: true,
          curChapter,
          subFile: subFile as any,
        });
        // storage存储子文件路径信息 当前章节
        wx.setStorageSync(this.data.fileInfoField, JSON.stringify(subFile));
        this.updateCurChapter();
        this.readChildFile();
      },
      fail: console.error
    })
  },
  /**
   * 创建缓存文件父级目录
   */
  createParentDir(fs: WechatMiniprogram.FileSystemManager) {
    try {
      fs.accessSync(`${wx.env.USER_DATA_PATH}${this.data.fileDir}`);
    } catch (e) {
      fs.mkdirSync(wx.env.USER_DATA_PATH + this.data.fileDir, false);
    }
  },
  /**
   * 创建缓存分块的子文件 -- 缓存文件  -- 多章一个缓存文件
   */
  createChildFiles(fs: WechatMiniprogram.FileSystemManager, data: string) {
    const bookArr = data.split(this.data.separator).filter(i => {
      return !!(String.prototype.trim.call(i))
    });
    const len = bookArr.length;
    const subFile: SubFile[] = [];
    const chinaReg = /[\u4E00-\u9FA5]+/;
    let fileName = this.data.splitPre + '1.txt';
    let subfileContent: string[] = [];
    let chapterName = "简介"; // 章节名称
    // 初始化新文件
    fs.writeFileSync(wx.env.USER_DATA_PATH + this.data.fileDir + fileName, '', 'utf8');
    bookArr.forEach((item, index) => {
      const itemStr = item.trimStart();
      if (item === itemStr && chinaReg.test(item)) {
        if (subfileContent.length > 0) {
          // console.log(fileName);
          console.log(subfileContent);
          // 写入上一章节的内容
          fs.appendFileSync(wx.env.USER_DATA_PATH + this.data.fileDir + fileName, subfileContent.join(this.data.separator), 'utf8');
          // 开始新的一章 重新开始收集内容
          // 收集了有效内容才开始新的章节
          if (subfileContent.some(i => chinaReg.test(i))) {
            subFile.push({
              chapterName,
              fileName,
            });
            subfileContent = [];
          }
          // 更新解析百分比
          const percent = parseInt(index / len * 100 + '');
          this.setData({ percent });
        }
        // 添加章节分隔符  和章节名
        subfileContent.push(this.data.divider);
        subfileContent.push(item + this.data.separator);
        chapterName = String.prototype.trim.call(item);
        // 满10(num)章  更新文件路径 初始化新文件
        const chapter = subFile.length + 1;
        if (chapter % this.data.num === 0) {
          fileName = `${this.data.splitPre}${chapter}.txt`;
          // 初始化新文件
          fs.writeFileSync(wx.env.USER_DATA_PATH + this.data.fileDir + fileName, '', 'utf8');
        }
      } else {
        subfileContent.push(item);
      }
    });
    console.log(fileName);
    console.log(subfileContent);
    // 写入最后一章的内容
    if (subfileContent.length > 0) {
      fs.appendFileSync(wx.env.USER_DATA_PATH + this.data.fileDir + fileName, subfileContent.join(this.data.separator), 'utf8');
      subFile.push({
        chapterName,
        fileName,
      });
    }
    return subFile
  },
  /**
   * 读取章节内容
   */
  readChildFile() {
    console.log(this.data.curChapter);
    // console.log(this.data.subFile);
    const fileName = (this.data.subFile[this.data.curChapter] as any)?.fileName;
    const fs = wx.getFileSystemManager();
    fs.readFile({
      filePath: wx.env.USER_DATA_PATH + this.data.fileDir + fileName,
      encoding: 'utf-8',
      success: res => {
        const data = res.data + '';
        const chapterArr = data.split(this.data.divider).filter(i => {
          const chinaReg = /[\u4E00-\u9FA5]+/;
          return chinaReg.test(i);
        }).map(i => {
          return i.split(this.data.separator);
        });
        const idx = this.data.curChapter % this.data.num;
        // console.log(chapterArr);
        this.setData({
          chapterArr,
          idx,
        });
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 300
        });
      },
      fail: console.error
    })
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
    };

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
    if (this.data.idx === this.data.num) {
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
    };

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
    if (status === 'open') {
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
      delay: 0
    });
    animation.translateX(-150).step();
    this.setData({
      listAnimation: animation.export()
    })
    setTimeout(() => {
      animation.translateX(0).step()
      this.setData({
        listAnimation: animation
      })
      if (status == "close") {
        this.setData({
          listFlag: false
        })
      }
    }, 100)
    if (status == "open") {
      this.setData({
        listFlag: true,
        listScrollTop: this.data.curChapter * 40,
      })
    }
  },
  /**
   * 跳到某一章click
   */
  handleJumpChapter(e: any) {
    const chapter = e.currentTarget.dataset.chapter;
    this.jumpChapter(chapter);
    this.listToggle('close');
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
      delay: 0
    });
    animation.translateY(150).step();
    this.setData({
      settingAnimation: animation.export(),
    });
    if (!settingFlag) {
      this.setData({
        settingFlag: true,
      })
    }
    setTimeout(() => {
      animation.translateY(0).step();
      this.setData({
        settingAnimation: animation,
      })
      if (settingFlag) {
        this.setData({
          settingFlag: false,
        })
      }
    }, 100)
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
    })
  },
  // 详细设置
  settingDetailToggle() {
    this.setData({
      settingDetailFlag: !this.data.settingDetailFlag,
    });
  },
})