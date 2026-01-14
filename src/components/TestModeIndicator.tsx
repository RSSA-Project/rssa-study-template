import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { useState } from "react";
import type { StudyStep } from "../types/rssa.types";
import TestFeedbackModal from "./TestFeedbackModal";
import TestModeToast, { type ToastType } from "./TestModeToast";

interface TestModeIndicatorProps {
  studyStep?: StudyStep;
}

const TestModeIndicator: React.FC<TestModeIndicatorProps> = ({ studyStep }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const handleShowToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  return (
    <>
      {/* Persistent Label on Top-Left */}
      <div
        className={clsx(
          "fixed top-1 left-1 z-[100]",
          "bg-amber-500 text-white font-bold px-3 py-1 opacity-50",
          "border-1 border-white",
          "text-sm uppercase tracking-wider pointer-events-none select-none",
        )}
      >
        Test Mode
      </div>

      {/* Feedback Button on Top-Right - Only visible if we have a study step */}
      {studyStep && (
        <button
          onClick={() => setIsModalOpen(true)}
          className={clsx(
            "fixed top-4 right-4 z-[100]",
            "bg-amber-500 text-white font-bold px-3 py-1 rounded-full shadow-lg",
            "border-2 border-white opacity-90 hover:opacity-100",
            "text-sm uppercase tracking-wider",
            "flex items-center gap-2 transition-all hover:scale-105 cursor-pointer pointer-events-auto",
          )}
        >
          <span>Feedback</span>
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
        </button>
      )}

      {/* Modal - only rendered if button was clickable (implies studyStep exists) */}
      <TestFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studyStep={studyStep}
        onShowToast={handleShowToast}
      />

      {/* Notification Toast */}
      <TestModeToast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default TestModeIndicator;
