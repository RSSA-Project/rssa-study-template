import { Checkbox } from '@headlessui/react';
import { useMutation } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useCallback, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useParticipant, useStudy } from 'rssa-api';
import type { StudyLayoutContextType } from '../types/study.types';
import { useStepCompletion } from '../hooks/useStepCompletion';

export interface BaseParticipant {
    study_participant_type_id: string;
    external_id: string;
    current_step_id: string;
    current_page_id?: string | null;
}

export interface ParticipantTokenObject {
    resume_code: string;
    token: string;
}

interface ConsentPageProps {
    children: React.ReactNode;
    participantTypeId: string;
    externalId: string;
    onConsentSuccess?: (token: string, resumeCode: string) => void;
    title?: string;
    itemTitle?: string; // "Testing an Interactive Movie Recommender..."
}

const ConsentPage: React.FC<ConsentPageProps> = ({
    children,
    participantTypeId,
    externalId,
    onConsentSuccess,
    title = "Key Information About the Research Study",
    itemTitle
}) => {
    const { studyStep } = useOutletContext<StudyLayoutContextType>();
    const { studyApi } = useStudy();
    const { setJwt } = useParticipant();
    const [agreed, setAgreed] = useState(false);
    const [resumeCode, setResumeCode] = useState<string>();
    const { isStepComplete, setIsStepComplete } = useStepCompletion();

    const consentMutation = useMutation({
        mutationFn: (participantData: BaseParticipant) => {
            return studyApi.post<BaseParticipant, ParticipantTokenObject>(
                `studies/${studyApi.getStudyId()}/new-participant`,
                participantData
            );
        },
        onSuccess: (tokenObject) => {
            setJwt(tokenObject.token);
            setResumeCode(tokenObject.resume_code);
            setIsStepComplete(true);
            onConsentSuccess?.(tokenObject.token, tokenObject.resume_code);
        },
        onError: (error) => {
            setIsStepComplete(false);
            console.error('Error creating participant:', error);
        },
    });

    const handleConsent = useCallback(async () => {
        if (!studyStep) return;
        consentMutation.mutate({
            study_participant_type_id: participantTypeId,
            external_id: externalId,
            current_step_id: studyStep?.id,
        });
    }, [studyStep, consentMutation, participantTypeId, externalId]);

    const consentButtonDisabled = !agreed || consentMutation.isPending || isStepComplete;

    // Fallback for cases where StudyLayoutContext might not be used or studyStep is not available yet logic? 
    // Assuming context is present as it's a template for the study.

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white shadow-md rounded-lg p-6 text-left">
                {itemTitle && (
                    <h3 className="text-2xl font-bold mb-4">
                        {itemTitle}
                    </h3>
                )}

                {title && (
                    <p className='informedConsent-title font-bold mt-4'>
                        {title}
                    </p>
                )}

                {children}

                <p className='font-bold mt-4'>
                    Consent
                </p>
                <p className='font-bold mb-2'>
                    By participating in the study, you indicate that you have
                    read the information written above, been allowed to ask any
                    questions, and you are voluntarily choosing to take part in
                    this research.
                </p>
            </div>

            <div className="flex items-center gap-x-3 ms-4 p-3 rounded-lg mt-3 bg-gray-50">
                <Checkbox
                    checked={agreed}
                    onChange={setAgreed}
                    className={clsx(
                        'group h-6 w-6 rounded-md p-1',
                        'ring-1 ring-inset ring-gray-300',
                        'data-[checked]:bg-amber-500 data-[checked]:ring-amber-300',
                        'cursor-pointer',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300'
                    )}
                    disabled={isStepComplete}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="hidden h-4 w-4 fill-white group-data-[checked]:block">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .207 1.05l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                </Checkbox>
                <label
                    className="text-gray-700 select-none cursor-pointer"
                    onClick={() => !isStepComplete && setAgreed(!agreed)}
                >
                    I have read and understood this consent form and I agree to participate in this research study
                </label>
            </div>

            <button
                className={clsx(
                    'm-3 p-3 rounded-md font-medium transition-colors duration-200',
                    consentButtonDisabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-sm'
                )}
                onClick={handleConsent}
                disabled={consentButtonDisabled}
            >
                {consentMutation.isPending ? (
                    <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting response...
                    </div>
                ) : isStepComplete
                    ? 'Consent recorded.'
                    : 'I consent to participate in this study'}
            </button>

            {resumeCode && (
                <div className="mt-4">
                    <p>Thank you for agreeing to participate in the study.</p>
                    <div
                        className={clsx(
                            'p-4 mx-auto mt-3 mb-3 w-45 h-30 bg-gray-200 rounded-md',
                            'text-3xl text-center content-center text-amber-900'
                        )}
                    >
                        <code>{resumeCode}</code>
                    </div>
                    <div>
                        <p>
                            Please copy the code above. In case the study session fails, you may be able to resume the
                            study by using the code.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsentPage;
