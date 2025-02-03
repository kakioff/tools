import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Icon } from "@iconify/react/dist/iconify.js"
import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function SystemHosts() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [hostsContent, setHostsContent] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [isTextMode, setIsTextMode] = useState(true)
    const [hostsObj, setHostsObj] = useState<string[][]>([])

    invoke<boolean>("is_admin").then(setIsAdmin)
    const getHostsContent = async () => {
        let hc = await invoke<string>("get_hosts_content")
        setHostsContent(hc)
        // hc.replace(/  +/g, " ").split("\n").forEach(item => {
        //     if (item.trim().startsWith("#") || item.trim().startsWith("?#") || item.trim().length == 0) return
        //     setHostsObj(val=>[...val,item.split(" ")])
        // });
    }
    useEffect(() => {
        getHostsContent()
    }, [])


    if (!isAdmin) {
        return <div className="flex flex-col items-center pt-[20svh] h-full w-full text-center text-muted-foreground text-3xl">请以管理员身份运行</div>
    }
    const updateHosts = async () => {
        try {
            setIsUpdating(true)

            await invoke<string>("update_hosts")
            getHostsContent()
            toast.success("更新成功")

        } catch {
            toast.error("更新失败")
        } finally {
            setIsUpdating(false)
        }
    }

    const saveHosts = async () => {
        try {
            await invoke("save_hosts_content", { content: hostsContent })
            toast.success("保存成功")
        } catch (error) {
            console.error(error)
            toast.error("保存失败")
        }
    }


    return <div className="h-full flex flex-col overflow-hidden">

        {isTextMode ? <Textarea className="h-full rounded-none resize-none" value={hostsContent} onChange={(e) => setHostsContent(e.target.value)} /> : <ScrollArea className="h-full">
            {hostsObj.map((item, index) => <div key={index} className="flex flex-row items-center gap-1 my-2">
                <Input type="text" value={item[0]} onChange={(e) => {
                    setHostsObj(newHostsObj => {
                        newHostsObj[index][0] = e.target.value
                        return newHostsObj
                    })
                }} />

                <Input type="text" value={item[1]} onChange={(e) => {
                    setHostsObj(newHostsObj => {
                        newHostsObj[index][1] = e.target.value
                        return newHostsObj
                    })
                }} />

            </div>)}
        </ScrollArea>}
        <div className="flex flex-row justify-between gap-2 p-1 items-center">


            <div>
                <Label className="flex flex-row items-center gap-2">
                    文本模式
                    <Switch checked={isTextMode} disabled={true} onCheckedChange={setIsTextMode} />
                </Label>
            </div>
            <div>
                <Button variant="ghost" disabled={true}>自动更新</Button>
                <Button disabled={isUpdating} variant="ghost" onClick={updateHosts}>
                    {isUpdating && <Icon icon="tabler:loader" className="animate-spin" />}
                    更新 Github Hosts
                </Button>
                <Button disabled={isUpdating} onClick={saveHosts}>保存</Button>
            </div>
        </div>

    </div>





}