import { useRef } from 'react';
import LingkeConfig, { LingkeConfigRef } from '../components/setting/lingkechaci';
import { Button } from '@/components/ui/button';
import DefaultConfig, { DefaultConfigRef } from '@/components/setting/default';
import { check } from "@tauri-apps/plugin-updater";

export default function Settings() {
    const lkConf = useRef<LingkeConfigRef>(null);
    const defConf = useRef<DefaultConfigRef>(null);
    const saveAllConfig = () => {
        lkConf.current?.save();
        defConf.current?.save();
    }

    const checkForUpdates = async () => {
        const update = await check();
        if (!update) {
            return
        }
        let downloaded = 0;
        let contentLength = 0;
        try {

            await update.downloadAndInstall((event) => {
                switch (event.event) {
                    case 'Started':
                        contentLength = event.data.contentLength as number;
                        console.log(`started downloading ${event.data.contentLength} bytes`);
                        break;
                    case 'Progress':
                        downloaded += event.data.chunkLength;
                        console.log(`downloaded ${downloaded} from ${contentLength}`);
                        break;
                    case 'Finished':
                        console.log('download finished');
                        break;
                }
            });
        } catch (error) {
            console.log('download failed', error);
        }
    }
    return (
        <div className=' px-4 pb-4 space-y-5'>
            <DefaultConfig ref={defConf} />
            <LingkeConfig showSaveButton={false} ref={lkConf} />
            <Button onClick={saveAllConfig} className='mt-4'>保存所有配置</Button>
            <Button onClick={checkForUpdates} className='mt-4'>检查更新</Button>
        </div>
    );
}