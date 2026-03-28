import { useStudy } from '@rssa-project/api';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboardButton } from '../components/CopyToClipboardButton';

type CompletionPayload = {
	completion_code: string;
	redirect_url: string;
	message: string;
};

const FinalPage: React.FC = () => {
	const { studyApi } = useStudy();

	const [timeLeft, setTimeLeft] = useState(30);
	const countdownRef = useRef<number>(30);

	const { data: completionResult } = useQuery({
		queryKey: ['study-completion'],
		queryFn: async () => await studyApi.get<CompletionPayload>(`studies/${studyApi.getStudyId()}/finalize`),
		enabled: !!studyApi,
	});

	useEffect(() => {
		if (completionResult) {
			countdownRef.current = setInterval(() => {
				setTimeLeft((prevTime: number) => {
					if (prevTime <= 1) {
						clearInterval(countdownRef.current);
						return 0;
					}
					return prevTime - 1;
				});
			}, 1000);
		}
		return () => {
			if (countdownRef.current) {
				clearInterval(countdownRef.current);
			}
		};
	}, [completionResult]);

	return (
		<div>
			<div className="mx-auto mt-7 text-left w-1/2">
				<p className="mt-5">{completionResult?.message}</p>
				<div className="mt-5">
					<p>
						You will be redirected back in <span className="font-bold">{timeLeft} second.</span>
					</p>
					<p>Please copy the completion code in case it is not automatically completed back in Prolific.</p>
					<div className="mt-5 border-l-4 border-yellow-400 bg-yellow-50 p-4">
						<div className="ml-3 text-yellow-700">
							<p className="text-sm font-bold">Completion Code: </p>
							<div className="mt-3 flex items-center justify-center gap-5">
								{completionResult?.completion_code ? (
									<>
										<p className="font-mono font-bold text-2xl">
											{completionResult.completion_code}
										</p>
										<CopyToClipboardButton textToCopy={completionResult.completion_code} />
									</>
								) : (
									<p>'Loading...'</p>
								)}
							</div>
						</div>
					</div>
					{completionResult?.redirect_url && (
						<div className="mt-3">
							<p>
								If you are not redirected after the 30 second timer runs out, please click the
								<a className="text-blue-500 ms-1" href={completionResult.redirect_url}>
									redirect link
								</a>
								.
							</p>
							<p className="mt-3">You may also copy/paste the following URL into your browser window.</p>
							<div className="flex items-center justify-center gap-5">
								<p className="my-5">
									<a className="text-blue-500" href={completionResult.redirect_url}>
										{completionResult?.redirect_url}
									</a>
								</p>
								<CopyToClipboardButton textToCopy={completionResult.redirect_url} />
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FinalPage;
