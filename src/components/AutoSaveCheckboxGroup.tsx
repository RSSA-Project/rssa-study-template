import { Checkbox, Field, Label, Input } from '@headlessui/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface AutoSaveCheckboxGroupProps {
	label: string;
	options: string[];
	hasOther?: boolean;
	otherLabel?: string;
	onSave: (vals: string[], otherText?: string) => void;
}

export const AutoSaveCheckboxGroup: React.FC<AutoSaveCheckboxGroupProps> = ({
	label,
	options,
	hasOther = false,
	otherLabel = 'Not listed (Please specify)',
	onSave,
}) => {
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [text, setText] = useState('');
	const debouncedText = useDebounce(text, 500);

	const handleToggle = (checked: boolean, opt: string) => {
		const next = new Set(selected);
		if (checked) next.add(opt);
		else next.delete(opt);
		setSelected(next);

		if (!next.has(otherLabel)) {
			setText('');
			onSave(Array.from(next));
		} else {
			onSave(Array.from(next), debouncedText);
		}
	};

	useEffect(() => {
		if (selected.has(otherLabel) && debouncedText !== '') {
			onSave(Array.from(selected), debouncedText);
		}
	}, [debouncedText, selected, onSave, otherLabel]);

	return (
		<Field className="mt-5 shadow-sm p-3 rounded">
			<Label>{label}</Label>
			{options.map((opt, idx) => (
				<div key={opt} className="flex items-center mt-2">
					<Checkbox
						id={`chk_${idx}`}
						checked={selected.has(opt)}
						onChange={(c) => handleToggle(c, opt)}
						className={clsx(
							'group block me-3 size-5 rounded border border-amber-500 bg-white cursor-pointer shadow-sm focus:border-yellow-500 focus:ring-yellow-500 data-checked:bg-amber-500'
						)}
					>
						<svg
							className="stroke-white opacity-0 group-data-checked:opacity-100"
							viewBox="0 0 14 14"
							fill="none"
						>
							<path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</Checkbox>
					<Label htmlFor={`chk_${idx}`}>{opt}</Label>
					{hasOther && opt === otherLabel && selected.has(opt) && (
						<Input
							value={text}
							onChange={(e) => setText(e.target.value)}
							className={clsx(
								'rounded-md p-2 ms-3 border-amber-400 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm font-mono'
							)}
						/>
					)}
				</div>
			))}
		</Field>
	);
};
