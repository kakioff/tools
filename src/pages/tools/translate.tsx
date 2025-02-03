import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Translate() {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    let webviewWindow = getCurrentWebviewWindow();

    const handleTranslate = async () => {
        if (loading) return;
        if (text.trim().length === 0) {
            setResult('');
            return;
        };
        setResult('');
        setLoading(true);
        // 创建一个唯一的事件监听器
        const eventId = "translate_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        webviewWindow.listen(eventId, (event) => {
            setResult(val => val + event.payload);
        });

        await invoke('translate', { text, eventId });
        setLoading(false);
    };
    let timer: NodeJS.Timeout;
    useEffect(() => {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            handleTranslate();
        }, 500);
        return () => timer && clearTimeout(timer);
    }, [text]);

    return <div className='flex flex-row gap-2 h-full w-full px-2 py-2'>
        <Textarea value={text} placeholder='请输入要翻译的文本' onChange={(e) => setText(e.target.value)} className='w-full h-full' />
        <div className='flex flex-col gap-2 w-full h-full justify-between border'>
            <ScrollArea className='h-full overflow-y-auto'>
                <p className='text-sm px-1 inline' dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }}>
                </p>
                {loading && <span className='inline-block w-3 h-3 bg-foreground rounded-full animate-pulse'></span>}
            </ScrollArea>
            <p className='flex flex-row gap-1 pb-1 px-1'>
                {<Button className={`w-full transition-all duration-300 ${!loading && result.length > 0 ? 'opacity-100' : 'opacity-0'}`} variant='outline' onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success('复制成功');
                }}>复制</Button>}
                <Button className='w-full transition-all duration-300' onClick={handleTranslate} disabled={loading}>{loading ? '翻译中...' : '翻译'}</Button>
            </p>
        </div>
    </div>
}