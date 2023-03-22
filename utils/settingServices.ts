import { Setting, SettingParams } from './settingTypes';
import { defaultSetting } from './config';

const settingField = 'setting';

class SettingServices {
    /**
     * 获取设置
     * @returns Setting
     */
    getSetting(): Setting {
        const settingStr = wx.getStorageSync(settingField);
        const setting = !!settingStr ? JSON.parse(settingStr) : {};
        return {
            ...defaultSetting,
            ...setting,
        }
    }
    /**
     * 更新设置
     * @param setting 
     */
    setSetting(setting: SettingParams): void {
        const Setting = this.getSetting();
        wx.setStorageSync(settingField, JSON.stringify({
            ...Setting,
            ...setting,
        }));
    }
}

export default new SettingServices();
