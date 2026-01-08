import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useStudy } from "rssa-api";
import type {
	MovieDetails,
	ParticipantRatingPayload,
	ParticipantRatingResponse,
	RatedItem,
} from "../../types/rssa.types";
import type { StudyLayoutContextType } from "../../types/study.types";
import StarRating from "./StarRating";

interface MutationResult {
	type: "POST" | "PATCH";
	id: string;
	item_id: string;
	rating: number;
	version: number;
}

const MovieCard = ({
	movie,
	userRating,
	onClick,
}: {
	movie: MovieDetails;
	userRating: RatedItem | undefined;
	onClick: () => void;
}) => {
	const { studyStep } = useOutletContext<StudyLayoutContextType>();
	const [currentRatedItem, setCurrentRatedItem] = useState<RatedItem | undefined>(userRating);
	const [movieRating, setMovieRating] = useState<number>(0);
	const [prevRating, setPrevRating] = useState<number>(0);
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const { studyApi } = useStudy();

	useEffect(() => {
		// Sync local state when prop changes (e.g. initial load or parent update)
		if (userRating) {
			setCurrentRatedItem(userRating);
			setMovieRating(userRating.rating);
			setPrevRating(userRating.rating);
		}
	}, [userRating]);

	const queryClient = useQueryClient();
	const ratingMutation = useMutation({
		mutationKey: ["movieRatings"],
		mutationFn: async (newRating: number): Promise<MutationResult> => {
			if (currentRatedItem && currentRatedItem.id) {
				// PATCH: Update existing rating
				// The backend schema ParticipantRatingUpdate only accepts id, version, and rated_item.
				const patchPayload = {
					id: currentRatedItem.id,
					version: currentRatedItem.version,
					rated_item: {
						item_id: currentRatedItem.item_id,
						rating: newRating,
					},
				};

				await studyApi.patch<typeof patchPayload, void>(
					`responses/ratings/${currentRatedItem.id}`,
					patchPayload
				);
				return {
					type: "PATCH",
					id: currentRatedItem.id,
					item_id: currentRatedItem.item_id,
					rating: newRating,
					version: (currentRatedItem.version || 0) + 1,
				};
			} else {
				// POST: Create new rating
				const postPayload: ParticipantRatingPayload = {
					study_step_id: studyStep.id,
					study_step_page_id: null,
					context_tag: "preference_elicitation",
					rated_item: {
						item_id: movie.id,
						rating: newRating,
					},
				};
				const response = await studyApi.post<ParticipantRatingPayload, ParticipantRatingResponse>(
					"responses/ratings/",
					postPayload
				);

				return {
					type: "POST",
					id: response.id,
					item_id: response.rated_item.item_id,
					rating: response.rated_item.rating,
					version: response.version,
				};
			}
		},
		onSuccess: (result) => {
			const newRatingItem: RatedItem = {
				id: result.id,
				item_id: result.item_id,
				rating: result.rating,
				version: result.version,
			};
			// Update local state so next time we know it's an existing item
			setCurrentRatedItem(newRatingItem);

			queryClient.setQueryData<RatedItem[]>(["movieRatings"], (oldRatings: RatedItem[] | undefined) => {
				const existingRatings = oldRatings || [];
				const index = existingRatings.findIndex((rat) => rat.item_id === result.item_id);
				if (index > -1) {
					return existingRatings.map((rat, i) => (i === index ? newRatingItem : rat));
				} else {
					return [...existingRatings, newRatingItem];
				}
			});
		},
		onError: () => {
			console.error("Failed to save rating on the server.");
			setMovieRating(prevRating);
		},
	});

	const handleRating = (newRating: number) => {
		if (ratingMutation.isPending || newRating === movieRating) return;
		setPrevRating(movieRating);
		setMovieRating(newRating);
		ratingMutation.mutateAsync(newRating);
	};

	return (
		<div
			className={clsx(
				"bg-red-200",
				"rounded-lg overflow-hidden shadow-lg",
				"transform transition-transform duration-300 hover:scale-115 cursor-pointer",
				"flex flex-col hover:z-10"
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
		>
			<div className="relative lg:h-54 xxl:h-81 flex items-center justify-center bg-black">
				<img
					className={clsx("h-full w-full", isHovered ? "object-contain" : "object-contain")}
					src={movie.tmdb_poster}
					alt={`Poster for ${movie.title}`}
					onError={(e) => {
						e.currentTarget.src = "https://placehold.co/400x600/000000/FFFFFF?text=No+Image";
					}}
				/>
				<div className={clsx("absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent")}>
					<div className="absolute bottom-0 w-full pt-4 px-1 flex flex-col items center text-center">
						<p className="text-white text-md font-medium mb-0 leading-tight">{movie.title}</p>
						<p className="text-gray-300 text-md mx-auto">{movie.year}</p>
					</div>
				</div>
			</div>
			<div className="bg-gray-700 py-1">
				<StarRating initialRating={movieRating} onRatingChange={handleRating} maxStars={5} />
			</div>
		</div>
	);
};

export default MovieCard;
