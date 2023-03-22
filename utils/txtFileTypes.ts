export interface SubFile {
  chapterName: string; // 章节名称
  fileName: string; // 文件名称
}

export interface FileInfo {
  fileDir: string;
  splitPre: string;
  fileInfoField: string;
  regIdx: number;
  updateProgress: (percent: number) => void;
  updateRegIdx: (regIdx: number) => void;
}

export interface File {
  name: string;
  size: number;
  path: string;
  time: number;
  type: string;
}
