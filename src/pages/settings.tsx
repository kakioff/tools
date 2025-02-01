import { useEffect, useMemo, useRef, useState } from 'react';
import LingkeConfig, { LingkeConfigRef } from '../components/setting/lingkechaci';
import { Button } from '@/components/ui/button';
import DefaultConfig, { DefaultConfigRef } from '@/components/setting/default';
import { check } from "@tauri-apps/plugin-updater";
import { getVersion } from "@tauri-apps/api/app";
import { ScrollArea } from '@/components/ui/scroll-area';
import { confirm, message } from '@tauri-apps/plugin-dialog';
import Dialog from '@/components/dialog';
import checkForUpdates from '@/utils/updater';
import { Progress } from '@/components/ui/progress';
import { exit } from '@tauri-apps/plugin-process';

export default function Settings() {
    const lkConf = useRef<LingkeConfigRef>(null);
    const defConf = useRef<DefaultConfigRef>(null);
    const saveAllConfig = () => {
        lkConf.current?.save();
        defConf.current?.save();
    }
    const [version, setVersion] = useState<string>('');
    const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);

    useEffect(() => {
        getVersion().then(setVersion);
    }, []);

    const [progress, setProgress] = useState<number>(0);
    const [fileSize, setFileSize] = useState<string>('');
    const [speed, setSpeed] = useState<string>('');
    const [started, setStarted] = useState<boolean>(false);

    const [updateError, setUpdateError] = useState<string>('');

    const checkUpdate = async () => {
        const update = await check();
        if (!update) {
            await message(`当前已是最新版本 v${version}，无需更新。`, {
                title: '更新提示'
            })

            return
        }
        setProgress(0)
        const confirmation = await confirm(`有新版本 v${update.version} 可用，是否更新？`, {
            cancelLabel: '取消',
            okLabel: '更新',
            title: '更新提示',
            kind: 'info'
        });
        if (!confirmation) {
            return
        }
        setShowUpdateDialog(true)
        checkForUpdates({
            autoInstall: false,
            start(fileSize) {
                setFileSize(fileSize)
                setStarted(true)
            },
            progress(downloaded, contentLength, speed) {
                setProgress(downloaded / contentLength * 100)
                setSpeed(speed)
            },
            finished() {
                setProgress(100)
                setStarted(false)
            },
            error(err) {
                console.log(err)
                setUpdateError(err as string)
            },
            cancel() {
                setShowUpdateDialog(false)
            }   
        })
    }

    return (
        <ScrollArea className='px-4 pb-4 overflow-y-auto h-full'>
            <DefaultConfig ref={defConf} />
            <p></p>
            <LingkeConfig showSaveButton={false} ref={lkConf} />
            <p className='text-right'>
                <Button onClick={saveAllConfig}>保存所有配置</Button>
            </p>
            <p className='flex flex-row justify-between items-center'>
                <span>当前版本：v{version}</span>
                <Button onClick={checkUpdate} variant="outline">检查更新</Button>
            </p>
            <p className='text-right'>
                <Button onClick={() => {
                    exit(0)
                }} variant="destructive">退出</Button>
            </p>
            <Dialog isOpen={showUpdateDialog} title='更新进度'>
                <div className='flex flex-row items-center justify-center gap-2'>
                    <Progress value={progress} />
                    <span className='nowrap text-sm text-muted-foreground'>{Number.isInteger(progress) ? progress : progress.toFixed(2)}%</span>
                </div>
                {updateError && <p className='text-sm text-red-500'>{updateError}</p>}
                <div className='text-sm text-muted-foreground flex flex-row items-center justify-between'>
                    {started ? <span className='w-24 inline-block text-sm text-muted-foreground text-right'>{speed}</span> : <div></div>}
                    <div>
                        <span className='inline-block mr-1'>{fileSize}</span>
                        <Button variant="ghost" disabled={started} onClick={() => setShowUpdateDialog(false)}>关闭</Button>
                    </div>
                </div>
            </Dialog>
        </ScrollArea>
    );
}