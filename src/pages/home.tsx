import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export default function Home() {
    const updateHosts = async ()=>{
        // 更新hosts
        // 检查是否是管理员
        const isAdmin = await invoke("is_admin")
        if (isAdmin) {
            await invoke("update_hosts")
        } else {
            toast.error("请以管理员身份运行")
        }


    }
    return (
        <div className=' px-4 pb-4 space-y-5'>
            <h1>主页</h1>
            <Button onClick={updateHosts}>update github hosts</Button>
        </div>
    );
};