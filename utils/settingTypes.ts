export interface Setting {
    oldTheme: number;
    curTheme: number;
    fontSize: number;
    night: boolean;
    lineHeightLevel: number;
}

export interface SettingParams {
    oldTheme?: number;
    curTheme?: number;
    fontSize?: number;
    night?: boolean;
    lineHeightLevel?: number;
}
