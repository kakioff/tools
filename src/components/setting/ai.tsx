import { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { getSetting, setSetting } from "@/utils/setting";

export type AiConfigRef = {
    save: () => void;
}
interface AiConfigProps {
    hiddenSaveButton?: boolean;
}
const AiConfig = forwardRef(({
    hiddenSaveButton = true
}: AiConfigProps, ref) => {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        getSetting<SiliconFlowConfigProps>('SiliconFlow').then((setting) => {
            if (setting) {
                setApiKey(setting.apiKey || '');
            }
        });
    }, []);

    const save = async () => {
        let setting = await getSetting('SiliconFlow') as SiliconFlowConfigProps;
        if (!setting) {
            setting = {
                apiKey: ''
            }
        }
        setting.apiKey = apiKey;
        await setSetting('SiliconFlow', setting);
    }

    useImperativeHandle(ref, () => ({
        save
    }));
    return <div className="space-y-4 px-1">
        <h2>AI配置</h2>
        <Label>SiliconFlow API Key</Label>
        <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key" />
        {!hiddenSaveButton && <Button onClick={save}>Save</Button>}
    </div>
})

export default AiConfig;
