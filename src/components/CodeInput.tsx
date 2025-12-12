import clsx from 'clsx';
import { useRef, useState } from 'react';

interface CodeInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
}

const CodeInput: React.FC<CodeInputProps> = ({ value, onChange, length = 5 }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const sanitizedValue = newValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        if (sanitizedValue.length <= length) {
            onChange(sanitizedValue);
        }
    };

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div className="relative flex justify-center" onClick={handleContainerClick}>
            <div className="flex items-center gap-2">
                {Array.from({ length }).map((_, index) => {
                    const char = value[index] || '';
                    const isActive = isFocused && index === value.length;
                    return (
                        <div
                            key={index}
                            className={clsx(
                                'flex h-16 w-12 items-center justify-center rounded-lg border-2 bg-gray-50',
                                'text-center text-3xl font-mono font-bold text-gray-800 transition-all duration-200',
                                {
                                    'border-gray-300': !isActive,
                                    'border-blue-500 ring-2 ring-blue-300': isActive,
                                }
                            )}
                        >
                            {char}
                        </div>
                    );
                })}
            </div>

            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxLength={length}
                className="absolute left-0 top-0 h-full w-full cursor-text opacity-0"
                aria-label="Enter your code"
            />
        </div>
    );
};

export default CodeInput;
