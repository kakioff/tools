import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";

export default function Home() {
    const updateHosts = async ()=>{
        await invoke("update_hosts")
    }
    return (
        <div className=' px-4 pb-4 space-y-5'>
            <h1>主页</h1>
            <Button onClick={updateHosts}>hosts</Button>
        </div>
    );
};