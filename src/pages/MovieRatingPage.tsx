
import { CheckCircleIcon } from '@heroicons/react/16/solid';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useEffect, useMemo } from 'react';
import { useStudy } from 'rssa-api';
import MovieCard from '../components/moviegallery/MovieCard';
import PaginatedResourceViewer from '../components/PaginatedDataViewer';
import { useStepCompletion } from '../hooks/useStepCompletion';
import type { MovieDetails, RatedItem } from '../types/rssa.types';

const RatingProgress: React.FC<{ completed: number; total: number }> = ({ completed, total }) => {
    const percentage = useMemo(() => {
        if (total === 0) return 0;
        return Math.min(100, (completed / total) * 100);
    }, [completed, total]);

    const isComplete = completed >= total;
    return (
        <div className="w-full mt-3">
            {/* Label K out of N */}
            <div className="flex justify-between items-center">
                {isComplete && (
                    <span>
                        <i>You are done but feel free to rate more for more accurate recommendations.</i>
                    </span>
                )}
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Progress:</span>
                <span className="text-xl font-bold text-gray-700">
                    {completed} / {total}{' '}
                    {isComplete && <CheckCircleIcon className="inline-block w-5 h-5 ml-1 align-text-middle" />}
                </span>
            </div>

            {/* Progress Bar Container */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full shadow-inner overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isComplete ? 'bg-amber-500' : 'bg-amber-300'}`}
                    style={{ width: `${percentage}%` }}
                    aria-valuenow={completed}
                    aria-valuemin={0}
                    aria-valuemax={total}
                    role="progressbar"
                ></div>
            </div>
        </div>
    );
};

interface MovieRatingPageProps {
    minRatingCount?: number;
    itemsPerPage?: number;
}

const MovieRatingPage: React.FC<MovieRatingPageProps> = ({
    minRatingCount = 10,
    itemsPerPage = 18
}) => {
    const { studyApi } = useStudy();
    const { setIsStepComplete } = useStepCompletion();

    const { data: ratedMovies } = useQuery({
        queryKey: ['movieRatings'],
        queryFn: async () => await studyApi.get<RatedItem[]>(`responses/ratings/`),
        enabled: !!studyApi,
    });

    const ratedCount = ratedMovies?.length ?? 0;

    useEffect(() => {
        if (ratedCount >= minRatingCount) setIsStepComplete(true);
    }, [ratedCount, minRatingCount, setIsStepComplete]);

    return (
        <div className="text-gray-900 my-3">
            <div className="justify-between p-3 bg-gray-300 rounded-3">
                <PaginatedResourceViewer<MovieDetails> apiResourceTag="movies" limit={itemsPerPage}>
                    {(movies, _, handleItemClick) => (
                        <div className={clsx('grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3')}>
                            {movies.length > 0 ? (
                                movies.map((movie) => {
                                    const ratedMovie = ratedMovies?.find(
                                        (rated: RatedItem) => rated.item_id === movie.id
                                    );
                                    return (
                                        <MovieCard
                                            key={movie.id}
                                            movie={movie}
                                            userRating={ratedMovie}
                                            onClick={() => handleItemClick(movie)}
                                        />
                                    );
                                })
                            ) : (
                                <p>No movies found for this page.</p>
                            )}
                        </div>
                    )}
                </PaginatedResourceViewer>
                <RatingProgress completed={ratedCount} total={minRatingCount} />
            </div>
        </div>
    );
};

export default MovieRatingPage;
