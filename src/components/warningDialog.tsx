import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { Fragment } from "react";

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
  confirmText = "Confirm",
  cancelCallback,
}) => {
  const handleClose = () => !disableHide && onClose(false);

  const htmlparser = (html: string) => {
    const clean = DOMPurify.sanitize(html);
    return parse(clean as string);
  };

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
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
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};
