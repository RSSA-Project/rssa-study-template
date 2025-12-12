import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

interface WarningDialogProps {
    show: boolean;
    title: string;
    message: string;
    onClose: (show: boolean) => void;
    confirmCallback?: () => void;
    confirmText?: string;
    cancelCallback?: () => void;
    disableHide?: boolean;
}

export const WarningDialog: React.FC<WarningDialogProps> = ({
    show,
    title,
    message,
    onClose,
    disableHide = false,
    confirmCallback,
    confirmText = 'Confirm',
    cancelCallback,
}) => {
    const handleClose = () => !disableHide && onClose(false);

    const htmlparser = (html: string) => {
        const clean = DOMPurify.sanitize(html);
        return parse(clean);
    };

    return (
        <Dialog open={show} onClose={handleClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                <DialogPanel className="max-w-lg space-y-4 border bg-white p-6 rounded-lg shadow-xl">
                    <DialogTitle className="font-bold text-lg">{title}</DialogTitle>
                    <div className="text-gray-700">{htmlparser(message)}</div>
                    <div className="flex gap-4 justify-end">
                        {!disableHide && cancelCallback && (
                            <button
                                onClick={cancelCallback}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Close
                            </button>
                        )}
                        {!disableHide && (
                            <button
                                onClick={confirmCallback ? confirmCallback : handleClose}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                {confirmText}
                            </button>
                        )}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};
