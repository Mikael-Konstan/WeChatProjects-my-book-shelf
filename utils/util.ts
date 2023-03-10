export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

export interface Setting {
  curTheme: number;
  night: boolean;
  fontSize: number;
  lineHeightLevel: number;
}

const defaultSetting: Setting = {
  curTheme: 0,
  night: false,
  fontSize: 32,
  lineHeightLevel: 3,
}
// 获取设置
export const getSetting = (): Setting => {
  const setting = wx.getStorageSync('setting');
  if (!setting) return defaultSetting;
  return JSON.parse(setting);
}
// 保存设置
export const saveSetting = (setting: Setting) => {
  const oldSetting = getSetting();
  wx.setStorageSync('setting', JSON.stringify({
    ...oldSetting,
    ...setting,
  }));
}
