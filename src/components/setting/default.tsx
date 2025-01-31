import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "../ui/switch";
import { getSetting, setSetting } from "@/utils/setting";


const formSchema = z.object({
    hiddenOnClose: z.boolean(),
})
type FormValues = z.infer<typeof formSchema>

export interface DefaultConfigRef {
    save(): void
}
interface Props {

}
const DefaultConfig = forwardRef<DefaultConfigRef, Props>(({

}, ref) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hiddenOnClose: false
        }
    });
    useEffect(() => {
        getSetting<boolean>("hiddenOnClose").then((value) => {
            value !== null && form.setValue("hiddenOnClose", value)
        })
    }, [])

    const saveConfig = form.handleSubmit(async () => {
        await setSetting("hiddenOnClose", form.getValues("hiddenOnClose"))
    })
    useImperativeHandle(ref, () => ({
        save: saveConfig
    }))
    return <Form {...form}>
        <form className="space-y-3">
            <h2>基本设置</h2>
            <FormField control={form.control} name="hiddenOnClose" render={({ field }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <FormLabel>关闭时隐藏</FormLabel>
                    <FormDescription>
                        关闭窗口时隐藏窗口
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch checked={field.value} onCheckedChange={async e => { field.onChange(e); await saveConfig(); }} />
                </FormControl>
            </FormItem>} />
        </form>
    </Form>
});

export default DefaultConfig;