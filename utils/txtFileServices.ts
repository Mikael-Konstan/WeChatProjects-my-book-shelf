import { SubFile, FileInfo } from "./txtFileTypes";
import { txtSeparator, num, minRows, newChapterReg } from './config';

export class TxtFileServices {
  // 缓存文件目录名称
  fileDir = "/file_***";
  // 缓存文件名称前缀
  splitPre = "/split_***";
  // 缓存文件路径 storage存储字段
  fileInfoField = "/split_***";
  regIdx = 0;
  fs: WechatMiniprogram.FileSystemManager;
  updateProgress: (percent: number) => void;
  updateRegIdx: (regIdx: number) => void;
  constructor(fileInfo: FileInfo) {
    this.fileDir = fileInfo.fileDir;
    this.splitPre = fileInfo.splitPre;
    this.fileInfoField = fileInfo.fileInfoField;
    this.regIdx = fileInfo.regIdx;
    this.updateProgress = fileInfo.updateProgress;
    this.updateRegIdx = fileInfo.updateRegIdx;
    this.fs = wx.getFileSystemManager();
  }

  /**
   * 文件解析
   */
  fileResolution(filePath: string): Promise<SubFile[]> {
    return new Promise((resolve, fail) => {
      this.fs.readFile({
        filePath,
        encoding: "utf-8",
        success: (res) => {
          // 创建缓存文件父级目录
          this.createParentDir();
          // 创建缓存分块的子文件
          const subFile = this.createChildFiles(res.data + "");
          // storage存储子文件路径信息 当前章节
          console.log("setStorageSync", subFile);
          wx.setStorageSync(this.fileInfoField, JSON.stringify(subFile));
          resolve(subFile);
        },
        fail,
      });
    });
  }
  /**
   * 创建缓存文件父级目录
   */
  createParentDir() {
    try {
      this.fs.accessSync(`${wx.env.USER_DATA_PATH}${this.fileDir}`);
    } catch (e) {
      this.fs.mkdirSync(wx.env.USER_DATA_PATH + this.fileDir, false);
    }
  }
  /**
   * 创建缓存分块的子文件 -- 缓存文件  -- 多章一个缓存文件
   * @return SubFile[] 章节名与子文件路径对照表
   */
  createChildFiles(data: string) {
    const bookArr: string[] = [];
    const regIdxs: number[] = new Array(newChapterReg.length).fill(0);
    data.split(txtSeparator).forEach((i) => {
      const item = String.prototype.trim.call(i);
      if (!!item) {
        bookArr.push(item);
        const idx = newChapterReg.findIndex(i => i.test(item));
        if (idx > -1) {
          regIdxs[idx]++;
        }
      }
    });
    let maxSum = regIdxs[0];
    regIdxs.forEach((sum, index) => {
      if (sum > maxSum) {
        maxSum = sum;
        this.regIdx = index;
      };
    });
    console.log(this.regIdx);
    this.updateRegIdx(this.regIdx);
    const len = bookArr.length;
    const subFile: SubFile[] = [];
    let chapter = 1;
    let fileName = this.getChildFileName(chapter);
    let subfileContent: string[] = [];
    let chapterName = "简介"; // 章节名称
    // 第一章 简介
    subFile.push({
      chapterName,
      fileName,
    });
    // 初始化新文件
    this.initChildFile(fileName);
    bookArr.forEach((item, index) => {
      if (this.isNewChapter(item)) {
        // console.log(fileName);
        // console.log(subfileContent);
        if (subfileContent.length < minRows) {
          subfileContent.push(item);
          const lastIndex = subFile.length - 1;
          subFile[lastIndex].chapterName = String.prototype.trim.call(item);
          return
        }
        // 子文件里写入上一章节的内容
        this.fs.appendFileSync(
          wx.env.USER_DATA_PATH + this.fileDir + fileName,
          subfileContent.join(txtSeparator) + txtSeparator,
          "utf8"
        );
        // 开始新的一章
        // 更新章节名
        chapterName = String.prototype.trim.call(item);
        // 更新文件路径  满num(10)章 初始化新文件
        if (chapter % num === 0) {
          fileName = this.getChildFileName(chapter);
          // 初始化新文件
          this.initChildFile(fileName);
        }
        chapter++;
        // 更新收集内容
        subfileContent = [];
        subFile.push({
          chapterName,
          fileName,
        });
        // 更新解析进度百分比
        const percent = parseInt((index / len) * 100 + "");
        this.updateProgress(percent);
      }
      subfileContent.push(item);
    });
    console.log('chapterName', chapterName);
    console.log('fileName', fileName);
    console.log('subfileContent', subfileContent);
    // 写入最后一章的内容
    if (subfileContent.length > 0) {
      this.fs.appendFileSync(
        wx.env.USER_DATA_PATH + this.fileDir + fileName,
        subfileContent.join(txtSeparator),
        "utf8"
      );
    }
    return subFile;
  }
  /**
   * 初始化子文件
   * @param fileName 子文件名称
   */
  initChildFile(fileName: string) {
    this.fs.writeFileSync(
      wx.env.USER_DATA_PATH + this.fileDir + fileName,
      "",
      "utf8"
    );
  }
  /**
   * 获取子文件名称
   * @param chapter 章节
   * @returns string
   */
  getChildFileName(chapter: number) {
    return `${this.splitPre}${chapter}.txt`;
  }
  /**
   * 是否为新章节
   */
  isNewChapter(content: string) {
    return newChapterReg[this.regIdx].test(content);
  }
  /**
   * 读取章节内容
   */
  readChildFile(subFile: SubFile[], curChapter: number): Promise<{
    chapterArr: string[][];
    idx: number;
  }> {
    // console.log(this.data.curChapter);
    // console.log(this.data.subFile);
    const fileName = (subFile[curChapter] as any)?.fileName;
    return new Promise((resolve, fail) => {
      this.fs.readFile({
        filePath: wx.env.USER_DATA_PATH + this.fileDir + fileName,
        encoding: "utf-8",
        success: (res) => {
          const data = res.data + "";
          const subBookArr = data.split(txtSeparator);
          // console.log(subBookArr);
          const chapterArr: string[][] = [];
          let chapterArrItem: string[] = [];
          subBookArr.forEach((item) => {
            if (this.isNewChapter(item) && chapterArrItem.length >= minRows) {
              chapterArr.push(chapterArrItem);
              chapterArrItem = [];
            }
            chapterArrItem.push(item);
          });
          // 添加最后一章
          if (chapterArrItem.length > 0) {
            chapterArr.push(chapterArrItem);
          }
          const idx = curChapter % num;
          // console.log(chapterArr);
          resolve({
            chapterArr,
            idx,
          });
        },
        fail,
      });
    });
  }
}
