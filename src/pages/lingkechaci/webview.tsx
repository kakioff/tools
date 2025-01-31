import { emit, listen } from "@tauri-apps/api/event";
import { useEffect, useRef } from "react";

export default function LingkeWebview() {
    let iframe = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const unlisten = listen('get-config', (event) => {
            console.log(event);
            console.log(iframe.current?.contentWindow);
            
            let data = {
                // uid: iframe.current?.contentWindow?.window.ids,
                cookie: '456',
            }
            console.log(data);
            
            emit('config', data);
        });

        return () => {
            unlisten.then((f) => f());
        };
    }, []);
    return (
        <iframe src="https://www.lingkechaci.com/" className=" w-svw h-svh border-none" ref={iframe}></iframe>
    );
}