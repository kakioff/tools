import { check } from "@tauri-apps/plugin-updater";
import { forwardRef, useImperativeHandle, useState } from "react";
import { confirm } from '@tauri-apps/plugin-dialog';
import { relaunch } from "@tauri-apps/plugin-process";


export interface UpdateBarRef {
    start(): Promise<void>
}
interface Props {
    autoInstall?: boolean
}
const UpdateBar = forwardRef<UpdateBarRef, Props>(({
    autoInstall = false
}, ref) => {
    const [contentLength, setContentLength] = useState(0)
    const [downloaded, setDownloaded] = useState(0)

    const startDownload = async () => {

        let update = await check();
        if (!update) return
        setContentLength(0)
        setDownloaded(0)
        try {
            await update.download(event => {
                switch (event.event) {
                    case 'Started':
                        setContentLength(event.data.contentLength as number)
                        break;
                    case 'Progress':
                        setDownloaded(val => val + event.data.chunkLength)
                        break;
                    case 'Finished':
                        break;
                }
            })
        } catch (error) {
            console.log('download failed', error);
        }
        if (!autoInstall) {
            const installNow = await confirm('下载完成，是否安装更新？', {
                cancelLabel: '取消',
                okLabel: '安装',
                title: '更新提示',
                kind: 'info'
            })
            if (!installNow) return
        }
        await update.install()
        const restartNow = await confirm('更新完成，是否重启应用？', {
            cancelLabel: '取消',
            okLabel: '重启',
            title: '更新提示',
            kind: 'info'
        })
        if(restartNow)
            await relaunch()
    }
    useImperativeHandle(ref, () => ({
        start: startDownload
    }))
    return <div>
        <div>UpdateBar</div>
        <div>{downloaded}/{contentLength}</div>
        <div>{downloaded / contentLength * 100}%</div>
    </div>
})

export default UpdateBar