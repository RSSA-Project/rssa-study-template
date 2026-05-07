import { Field, Label, Input } from '@headlessui/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import Select from '../components/Select';
import { useDebounce } from '../hooks/useDebounce';

interface AutoSaveSelectProps {
	label: string;
	options: string[];
	initialValue?: string | null;
	hasOther?: boolean;
	otherLabel?: string;
	onSave: (val: string, otherText?: string) => void;
}

export const AutoSaveSelect: React.FC<AutoSaveSelectProps> = ({
	label,
	options,
	initialValue = null,
	hasOther = false,
	otherLabel = 'Prefer to self-describe',
	onSave,
}) => {
	const [val, setVal] = useState<string | null>(initialValue);
	const [text, setText] = useState('');
	const debouncedText = useDebounce(text, 500);

	const handleChange = (newVal: string) => {
		setVal(newVal);
		if (newVal !== otherLabel) {
			setText('');
			onSave(newVal);
		} else {
			onSave(newVal, debouncedText);
		}
	};

	useEffect(() => {
		if (val === otherLabel && debouncedText !== '') {
			onSave(val, debouncedText);
		}
	}, [debouncedText, val, onSave, otherLabel]);

	return (
		<Field className="mt-5 shadow-sm p-3 rounded">
			<Label className="me-5">{label}</Label>
			<div className="flex items-center">
				<Select placeholder="Please choose an option" onChange={(v) => handleChange(v as string)}>
					{options}
				</Select>
				{hasOther && val === otherLabel && (
					<Input
						value={text}
						onChange={(e) => setText(e.target.value)}
						className={clsx(
							'rounded-md p-3 ms-3 border-amber-400 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm font-mono'
						)}
					/>
				)}
			</div>
		</Field>
	);
};
