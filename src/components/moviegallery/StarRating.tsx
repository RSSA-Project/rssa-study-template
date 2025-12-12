
import clsx from 'clsx';
import { useState } from 'react';

const StarRating = ({
    initialRating = 0,
    onRatingChange,
    maxStars = 5,
}: {
    initialRating: number;
    onRatingChange: (newRating: number) => void;
    maxStars: number;
}) => {
    const [hoveredRating, setHoveredRating] = useState<number>(0);

    const starIcon = (
        <svg
            className="w-5 h-5 transition-colors duration-200"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
        >
            <path d="M12 2l3.09 6.31 6.91.89-5 4.87 1.18 6.88-6.18-3.25-6.18 3.25 1.18-6.88-5-4.87 6.91-.89z" />
        </svg>
    );

    return (
        <div className="flex justify-center items-center space-x-1 my-3">
            {[...Array(maxStars)].map((_, index) => {
                const ratingValue = index + 1;
                const isFilled = ratingValue <= (hoveredRating || initialRating);

                return (
                    <div
                        key={index}
                        className={clsx(
                            'cursor-pointer',
                            isFilled ? 'text-amber-400' : 'text-gray-300',
                            'transform transition-transform duration-200 hover:scale-110'
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            onRatingChange(ratingValue);
                        }}
                        onMouseEnter={() => setHoveredRating(ratingValue)}
                        onMouseLeave={() => setHoveredRating(0)}
                    >
                        {starIcon}
                    </div>
                );
            })}
        </div>
    );
};

export default StarRating;
