import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
// import { clsx } from "clsx";

interface TestModeConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const TestModeConfirmation: React.FC<TestModeConfirmationProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => {}} // Force user to choose an option
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl border border-gray-200">
          <DialogTitle className="font-bold text-xl text-amber-600">
            Test Mode Warning
          </DialogTitle>
          <div className="space-y-4 text-gray-700">
            <p className="font-bold">
              You are accessing a test build of this study, are you sure you
              want to continue?
            </p>
            <p className="text-sm bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-900">
              <strong>Note:</strong> If you are a study participant, this is not
              the correct URL. Please go back to your platform and click the URL
              from the study posting. This application will not give you
              completion credit.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 font-medium transition-colors"
            >
              Yes, I am a valid test user
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default TestModeConfirmation;
