import { Transition } from "@headlessui/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

export type ToastType = "success" | "error";

interface TestModeToastProps {
  show: boolean;
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const TestModeToast: React.FC<TestModeToastProps> = ({
  show,
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-start px-4 py-6 sm:p-6 z-[300]"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {/* Positioning: "floating label right below the header" 
            Assuming header is top bar. 
            sm:items-end puts it on the right. User said "below the header".
            I'll render it centered top, with a top offset.
        */}
        <Transition
          show={show}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 mt-16">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {type === "success" ? (
                    <CheckCircleIcon
                      className="h-6 w-6 text-green-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircleIcon
                      className="h-6 w-6 text-red-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{message}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default TestModeToast;
