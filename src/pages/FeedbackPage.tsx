import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useStudy } from "rssa-api";
import { WarningDialog } from "../components/warningDialog";
import { useNextButtonControl } from "../hooks/useNextButtonControl";
import { useStepCompletion } from "../hooks/useStepCompletion";
import type { StudyLayoutContextType } from "../types/study.types";


export type Feedback = {
    feedback_text: string;
    feedback_type: string;
    feedback_category: string;
    study_step_id: string;
    context_tag: string;
};

export type TextResponsePayload = {
    study_step_id: string;
    study_step_page_id?: string;
    context_tag: string;
    response_text: string;
};


const FeedbackPage: React.FC = () => {
    // @ts-ignore
    const { studyStep, resetNextButton } = useOutletContext<StudyLayoutContextType>();

    const { setButtonControl } = useNextButtonControl();
    const { setIsStepComplete } = useStepCompletion();
    const { studyApi } = useStudy();

    const [showWarning, setShowWarning] = useState<boolean>(false);
    const feedbackRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setButtonControl(prev => ({ ...prev, isDisabled: true }));
        return () => {
            if (resetNextButton) resetNextButton();
        }
    }, [setButtonControl, resetNextButton]);

    const feedbackMutation = useMutation({
        mutationKey: ['FreeformTextResponse'],
        mutationFn: async (payload: TextResponsePayload) => studyApi.post<TextResponsePayload, null>('responses/texts/', payload),
        onSuccess: () => {
            setIsStepComplete(true);
            if (resetNextButton) resetNextButton();
        },
        onError: (error) => {
            console.error("Error submitting feedback:", error);
            setButtonControl(prev => ({ ...prev, isDisabled: true }));
        }

    });

    const submitFeedback = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (feedbackRef.current) {
            const feedbackText = feedbackRef.current.value;
            if (feedbackText.length === 0) {
                setShowWarning(true);
                return;
            }

            feedbackMutation.mutate({
                study_step_id: studyStep.id,
                context_tag: 'post-intervention-debrief',
                response_text: feedbackText
            });
        }
    }, [feedbackMutation, studyStep, setShowWarning]);

    const handleWarningConfirm = () => {
        setShowWarning(false);
        setIsStepComplete(true);
        if (resetNextButton) resetNextButton();
    }



    const isSubmitting = feedbackMutation.isPending;
    const isSuccess = feedbackMutation.isSuccess;

    return (
        <div className="w-full">
            {showWarning && <WarningDialog show={showWarning} confirmCallback={handleWarningConfirm}
                title="Empty feedback" message="<p>You hardly wrote anything.</p><p>Are you sure you are done?</p>"
                confirmText="Yes, I'm done"
                cancelCallback={() => setShowWarning(false)}
                onClose={setShowWarning}
            />}
            <div className="w-1/3 text-left mx-auto">
                <form>
                    <label htmlFor='feedbackInput'>
                        <p className="mt-5">Thank you for participating in our study!</p>
                        <p className="mt-3">
                            Tell us about your experience with the study. This is a research study and your feedback is not
                            only important to us, but also greatly appreciated.
                        </p>
                        <p className="mt-3">
                            You can include any suggestions, or your thoughts on the system that you interacted with. Your
                            feedback will help future studies and also the design of real world systems.
                        </p>
                    </label>
                    <textarea
                        title={'Feedback input textarea'}
                        placeholder="Please include as much detail as you can."
                        id="feedbackInput"
                        name='feedbackInput'
                        ref={feedbackRef}
                        rows={6}
                        disabled={isSubmitting || isSuccess}
                        className={clsx(
                            "rounded-md",
                            'p-3 mt-5',
                            'block w-full rounded-md border-amber-400',
                            'shadow-sm focus:border-yellow-500 focus:ring-yellow-500',
                            'sm:text-sm font-mono',
                            (isSubmitting || isSuccess) && "bg-gray-100"
                        )}
                    />

                    <button
                        type="button"
                        className={clsx(
                            "m-5 p-3 rounded-md cursor-pointer",
                            isSubmitting || isSuccess ? 'bg-gray-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'
                        )}
                        onClick={submitFeedback}
                        disabled={isSubmitting || isSuccess}
                    >
                        {isSubmitting ? 'Submitting...' : isSuccess ? 'Submitted' : 'Submit Feedback'}
                    </button>
                </form>
            </div>

        </div>
    );
}

export default FeedbackPage;
