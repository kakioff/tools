import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Props {
    isOpen?: boolean,
    onOpenChange?(open: boolean): void,
    children?: React.ReactNode,
    title?: string,
}
export default function Dialog({
    isOpen = false,
    onOpenChange,
    children,
    title
}: Props) {
    return <AlertDialog open={isOpen} onOpenChange={onOpenChange} >
        <AlertDialogContent>
            <AlertDialogHeader>
                {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
            </AlertDialogHeader>
            {children}
        </AlertDialogContent>
    </AlertDialog>

}