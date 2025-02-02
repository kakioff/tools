import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { getSetting, setSetting } from '../../utils/setting';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
// import { getAllWebviewWindows, WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
// import { Event } from '@tauri-apps/api/event';

const formSchema = z.object({
    userId: z.string(),
    cookie: z.string(),
})
export interface LingkeConfigRef {
    save: () => void
}
interface Props {
    showSaveButton?: boolean
}
const LingkeConfig = forwardRef<LingkeConfigRef, Props>(({
    showSaveButton = true
}: Props, ref: any) => {
    // let [webview, setWebview] = useState<WebviewWindow | null>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userId: "",
            cookie: "",
        },
    })

    useEffect(() => {
        getSetting<LingkeConfigProps>('lingkechaci').then((config) => {
            if (config) {
                form.setValue('userId', config.userId);
                form.setValue('cookie', config.cookie);
            }
        });
    }, [])
    // 处理提交事件
    const saveConfig = async () => {
        await setSetting('lingkechaci', form.getValues());
    }

    useImperativeHandle(ref, () => ({
        save: saveConfig
    }))

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(saveConfig)} className="space-y-4 px-1">
                <h2>
                    <a href="https://www.lingkechaci.com/" target='_blank' className='underline mr-1'>领克查词</a>
                    配置
                    {
                        // webview ? <>
                        //     <Button size="sm" variant="ghost" onClick={autoLoad.loadConfig}>获取</Button>
                        //     <Button size="sm" variant="ghost" onClick={autoLoad.closeWebview}>取消</Button>
                        // </> : <Button size="sm" variant="ghost" onClick={autoLoad.openWebview}>自动获取</Button>
                    }
                </h2>
                <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>用户ID</FormLabel>
                            <FormControl>
                                <Input placeholder="用户ID" {...field} />
                            </FormControl>
                            <FormDescription>
                                <code className='select-none' onDoubleClick={() => {
                                    // 复制到剪贴板
                                    navigator.clipboard.writeText("ids");
                                    toast.success("已复制到剪贴板")
                                }}>ids</code>
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cookie"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cookie</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Cookie" {...field} />
                            </FormControl>
                            <FormDescription>
                                <code className='select-none' onDoubleClick={() => {
                                    // 复制到剪贴板
                                    navigator.clipboard.writeText("document.cookie");
                                    toast.success("已复制到剪贴板")
                                }}>document.cookie</code>
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {showSaveButton && <Button type="submit">保存</Button>}
            </form>
        </Form>
    );
});
export default LingkeConfig;
