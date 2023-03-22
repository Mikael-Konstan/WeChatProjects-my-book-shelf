import { Setting } from './settingTypes';
import { ColorTheme } from './types';

// 默认阅读设置
const defaultSetting: Setting = {
    curTheme: 0,
    fontSize: 48,
    night: false,
    lineHeightLevel: 3,
}

// 颜色主题
const colorTheme: ColorTheme[] = [
    {
        text_bgc: "#E3D9C0",
        text_font: "#3C2911",
        list_bgc: "#EDE2C4",
        list_border: "#DDEBDA",
        list_font: "#67573E",
        list_cur_font: "#E29C3A",
        list_next_font: "#A4BBA1",
    },
    {
        text_bgc: "#D4E3D0",
        text_font: "#0D1C09",
        list_bgc: "#DDEBDA",
        list_border: "#DDEBDA",
        list_font: "#2F442A",
        list_cur_font: "#E29C3A",
        list_next_font: "#A4BBA1",
    },
    {
        text_bgc: "#242424",
        text_font: "#888D90",
        list_bgc: "#2C2E2D",
        list_border: "#2C2E2D",
        list_font: "#919B9C",
        list_cur_font: "#E29C3A",
        list_next_font: "#5A6465",
    },
]

// 行高倍数
const lineHeights = [1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6];

// txt文件换行符
const txtSeparator = "\n";

// 多少章一个缓存文件
const num = 24;

// const chinaReg = /[\u4E00-\u9FA5]+/; // 校验中文
// 校验是为新章节的正则
const newChapterReg = [
    /[第]{1}[0-9]+[章]{1}/g,
    /[第]{1}[零一二三四五六七八九十百千]+[章]{1}/g,
];

const defaultReadInfo = {
    curChapter: 0,
    scrollTop: 0,
    regIdx: 0,
}

export {
    defaultSetting,
    colorTheme,
    lineHeights,
    txtSeparator,
    num,
    newChapterReg,
    defaultReadInfo,
}
