interface LingkeConfigProps{
    userId: string;
    cookie: string;
}
interface Chaci{
    replace: {
        [org: string]: string; // 替换规则
    }
}
interface SettingType {
    lingkechaci: LingkeConfigProps;
    chaci: Chaci;
    hiddenOnClose: boolean;
}