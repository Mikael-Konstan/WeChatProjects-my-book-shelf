import { TxtFileServices } from "./txtFileServices";
import { ReadInfoServices } from "./readInfoServices";
import { SubFile } from "./txtFileTypes";

export interface Image {
  img: { [key: string]: string };
}

export interface File {
  id: string;
  name: string;
  size: number;
  path: string;
  time: number;
  type: string;
  rename?: string;
}

export interface ColorTheme {
  nav_bar_font: string;
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

export interface IIntroBookShelfData extends Image {
  tempFiles: File[];
  settingFlag: boolean;
  settingAnimation: WechatMiniprogram.Animation;
  selectedIds: string[];
  toppingIds: string[];
}

export interface ColorThemeItem {
  text_bgc: string;
  text_font: string;
  list_bgc: string;
  list_border: string;
  list_font: string;
  list_cur_font: string;
  list_next_font: string;
}

export interface IIntroDetailData extends Image {
  loadingHidden: boolean;
  percent: number;
  file: File;
  // 文件或目录 路径必须使用 wx.env.USER_DATA_PATH 即时获取
  // 存入data就会有问题
  curChapter: number;
  subFile: SubFile[];
  idx: number;
  chapterArr: string[][];
  readPercent: number;
  scrollTop: number;
  listContainerAnimation: WechatMiniprogram.Animation;
  listAnimation: WechatMiniprogram.Animation;
  listScrollIntoView: string;
  theme: ColorThemeItem[];
  settingFlag: boolean;
  settingAnimation: WechatMiniprogram.Animation;
  settingDetailFlag: boolean;
  fontSizeMin: number;
  fontSizeMax: number;
  oldTheme: number;
  curTheme: number;
  fontSize: number;
  night: boolean;
  lineHeightLevel: number;
  lineHeights: number[];
  txtFileServ: TxtFileServices | null;
  readInfoServ: ReadInfoServices | null;
  timer: number;
  pageHeight: number;
  renderLineHeight: number;
}
