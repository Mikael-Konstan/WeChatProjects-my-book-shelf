export interface ReadInfo {
    curChapter: number; // 当前所读章节
    scrollTop: number; // 正文滑动位置
    regIdx: number; // 新章节校验选择正则索引
}

export interface ReadInfoParams {
    curChapter?: number;
    scrollTop?: number;
    regIdx?: number;
}
