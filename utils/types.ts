import { TxtFileServices } from "./txtFileServices";
import { ReadInfoServices } from "./readInfoServices";
import { SubFile } from "./txtFileTypes";

export interface File {
  name: string;
  size: number;
  path: string;
  time: number;
  type: string;
}

export interface ColorTheme {
    text_bgc: string;
    text_font: string;
    list_bgc: string;
    list_border: string;
    list_font: string;
    list_cur_font: string;
    list_next_font: string;
}

export interface IIntroPage {
    [key: string]: any;
}

export interface IIntroBookShelfData {
  tempFiles: File[]
}

export interface IIntroDetailData {
    loadingHidden: boolean;
    percent: number;
    file: File;
    // 文件或目录 路径必须使用 wx.env.USER_DATA_PATH 即时获取
    // 存入data就会有问题
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
    lineHeightLevel: number;
    lineHeights: number[];
    txtFileServ: TxtFileServices | null;
    readInfoServ: ReadInfoServices | null;
    timer: number;
}
