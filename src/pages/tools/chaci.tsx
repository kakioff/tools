import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { getSetting, setSetting } from "@/utils/setting";
import { Icon } from "@iconify/react/dist/iconify.js";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function Chaci() {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [output, setOutput] = useState<Array<ChaciChecked>>([])
  const [replaces, setReplaces] = useState<{
    words: string,
    replace: string
  }[]>([])
  const [replaceConf, setReplaceConf] = useState<Chaci["replace"]>({})

  useEffect(() => {
    getSetting("chaci").then(res => {
      // @ts-ignore
      setReplaceConf(res?.replace || {})
    })
  })
  /**
   * 提交
   */
  const submit = async () => {
    try {
      setLoading(true)
      let res = await invoke<string>("lingkechaci", {
        content
      })
      
      setOutput(JSON.parse(res).data)
      setLoaded(true)
    } catch (e) {
      console.log(e)
      toast.error("出错了")
    } finally {
      setLoading(false)
    }
  }, submitReplace = (item?: {
    words: string,
    replace: string
  }) => {
    for (let i = 0; i < replaces.length; i++) {
      let ri = replaces[i]
      if (item && (ri.words === item.words)) {
        setContent(content.replace(ri.words, ri.replace))
        return
      }
      if (ri.replace) {
        setContent(content.replace(ri.words, ri.replace))
      }
    }
  }, saveConfig = async () => {
    let config = await getSetting("chaci") as Chaci
    if (!config) {
      config = {
        replace: {}
      }
    }
    let newConf: any = {}
    replaces.forEach(item => {
      if (item.replace) {
        newConf[item.words] = item.replace
      }
    })
    config.replace = {
      ...config.replace,
      ...newConf
    }
    console.log(config);

    await setSetting("chaci", config)
  }

  const previewContent = useMemo(() => {
    if (!loaded) return content
    // let chaciConf = await getSetting("chaci") as Chaci
    // let replaceConf = chaciConf.replace || {}
    let text = content
    setReplaces([])
    output.forEach((item) => {
      let reg = new RegExp(item.words, "g")
      text = text.replace(reg, `<span style="background-color:red">${item.words}</span>`)
      setReplaces(prev => [...prev, {
        words: item.words,
        replace: replaceConf[item.words] || ""
      }])
    })
    return text
  }, [loaded, output, content])
  return <div className="h-full px-2 py-2">
    {!loaded ? <div className="h-full flex flex-col gap-4">
      <Textarea disabled={loading}
        value={content} className="h-full"
        onChange={(e) => setContent(e.target.value)} />
      <div className="flex flex-row justify-between items-center select-none">
        <div>
          {/* 设置 */}
        </div>
        <div>
          <Button onClick={() => setContent("")} disabled={loading || !content} variant="ghost">清空</Button>
          <Button onClick={submit} disabled={loading || !!!content}>
            {loading && <Icon icon="mdi:loading" className="animate-spin" />}
            提交
          </Button>
        </div>
      </div>
    </div> : <div className="flex flex-row justify-between items-start h-full gap-2">
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="h-full w-full break-all p-1" />
      <ScrollArea className="w-full overflow-y-auto">
        <div dangerouslySetInnerHTML={{ __html: previewContent }} className=" break-all" />
      </ScrollArea>
      <div className="w-1/5 min-w-44 flex-none flex flex-col justify-between h-full bg-foreground/5 pl-2 pr-1">
        <ScrollArea className="h-full overflow-y-auto">
          {replaces.map(item => <div key={item.words} className="flex flex-row items-center my-1 first:mt-0 last:mb-0 group">
            <span className=" text-nowrap mr-1">{item.words}</span>
            {/* <Icon icon="tabler:arrow-right" className="text-2xl" /> */}
            :
            <Input className="h-8 w-full p-1" value={item.replace}
              onChange={e => setReplaces(prev => prev.map(i => i.words === item.words ? { ...i, replace: e.target.value } : i))} />
            <Button size="icon" variant="ghost" className="w-0 overflow-hidden group-hover:w-auto group-hover:min-w-[20px] transition-all" onClick={() => submitReplace(item)}>
              <Icon icon="mdi:check" />
            </Button>
          </div>)}
        </ScrollArea>
        <div className=" grid grid-cols-2 gap-[1px]">
          <span></span>
          <Button variant="outline" size="sm" onClick={() => {
            navigator.clipboard.writeText(content)
          }}>复制</Button>
          <Button variant="outline" size="sm" onClick={saveConfig}>保存预设</Button>
          <Button variant="outline" size="sm" onClick={() => {
            setLoaded(false);
            submit();
          }}>重新检测</Button>
          <Button variant="destructive" size="sm" onClick={() => { setLoaded(false); setContent("") }}>清空</Button>
          <Button variant="default" size="sm" onClick={() => submitReplace()}>全部替换</Button>
        </div>
      </div>
    </div>}

  </div>
}