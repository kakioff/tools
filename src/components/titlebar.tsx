import { Window } from '@tauri-apps/api/window';

import { Button } from "./ui/button";
import { Icon } from '@iconify/react/dist/iconify.js';
import { SidebarTrigger } from './ui/sidebar';
import { getSetting } from '@/utils/setting';
import { useEffect, useState } from 'react';

interface TitleBarProps {
    showSidebarTrigger: boolean
}
export default function TitleBar({ showSidebarTrigger }: TitleBarProps) {
    const appWindow = Window.getCurrent();

    const [isMaximized, setIsMaximized] = useState(true)

    const [isMinimized, setIsMinimized] = useState(true)
    const [isClosable, setIsClosable] = useState(true)

    useEffect(() => {
        appWindow.isMaximizable().then((able) => {
            setIsMaximized(able)
        })
        appWindow.isMinimizable().then((able) => {
            setIsMinimized(able)
        })
        appWindow.isClosable().then((able) => {
            setIsClosable(able)
        })
    })

    const minimize = async () => {
        await appWindow.minimize();
    },
        maximize = async () => {
            await appWindow.toggleMaximize();
        },
        close = async () => {
            let ishidden = await getSetting('hiddenOnClose')

            if (ishidden && appWindow.label === "main")
                await appWindow.hide();
            else
                await appWindow.close();
        }
    return <div data-tauri-drag-region className="w-full select-none flex justify-between items-center sticky top-0 backdrop-blur h-[var(--titlebar-height)]">
        <div>
            {showSidebarTrigger && <SidebarTrigger />}
        </div>
        <div>
            {isMinimized && <Button size="icon" variant="outline" className="rounded-none" onClick={minimize}>
                <Icon icon="tabler:minus" />
            </Button>}
            {isMaximized && <Button size="icon" variant="outline" className="rounded-none -mx-[1px]" onClick={maximize}>
                <Icon icon="tabler:maximize" />
            </Button>}

            {isClosable && <Button size="icon" variant="outline" disabled={!isClosable} className="rounded-none hover:text-white hover:bg-red-500" onClick={close}>
                <Icon icon="tabler:x" />
            </Button>}

        </div>
    </div>
}