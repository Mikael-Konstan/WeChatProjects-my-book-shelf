import { ReadInfo, ReadInfoParams } from './readInfoTypes';
import { defaultReadInfo } from './config';

export class ReadInfoServices {
    readInfoField: string;

    constructor(readInfoField: string) {
        this.readInfoField = readInfoField;
    }
    /**
     * 获取设置
     * @returns ReadInfo
     */
    getReadInfo(): ReadInfo {
        const readInfoStr = wx.getStorageSync(this.readInfoField);
        const readInfo = !!readInfoStr ? JSON.parse(readInfoStr) : {};
        return {
            ...defaultReadInfo,
            ...readInfo,
        }
    }
    /**
     * 更新设置
     * @param readInfo 
     */
    setReadInfo(readInfo: ReadInfoParams): void {
        const ReadInfo = this.getReadInfo();
        wx.setStorageSync(this.readInfoField, JSON.stringify({
            ...ReadInfo,
            ...readInfo,
        }));
    }
}
