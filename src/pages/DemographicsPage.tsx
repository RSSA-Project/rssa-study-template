import { Checkbox, Field, Input, Label } from '@headlessui/react';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { useStudy } from '@rssa-project/api';
import Select from '../components/Select';
import { useStepCompletion } from '../hooks/useStepCompletion';
import countryList from '../res/country_state.json';

const AGE_OPTIONS = [
	'18 - 24 years old',
	'25 - 29 years old',
	'30 - 34 years old',
	'35 - 39 years old',
	'40 - 44 years old',
	'45 - 49 years old',
	'50 - 54 years old',
	'55+',
	'Prefer not to say',
];

const GENDER_OPTIONS = ['Woman', 'Man', 'Non-binary', 'Prefer not to disclose', 'Prefer to self-describe'];

const RACE_OPTIONS = [
	'White',
	'Black or African American',
	'Asian',
	'Native Hawaiian or Pacific Islander',
	'Hispanic',
	'Two or more races',
	'Prefer not to answer',
	'Not listed (Please specify)',
];

const EDUCATION_OPTIONS = [
	'Some high school',
	'High school',
	'Some college',
	'Trade, technical or vocational training',
	"Associate's degree",
	"Bachelor's degree",
	"Master's degree",
	'Professional degree',
	'Doctorate',
	'Prefer not to say',
];

interface Demographic {
	id?: string;
	age_range: string;
	gender: string;
	gender_other: string;
	race: string[];
	race_other: string;
	education: string;
	country: string;
	state_region: string;
}

type CountryItems = {
	name: string;
	countryCode: string;
	countryCodeAlpha3: string;
	stateProvinces: string[];
};

const DemographicsPage: React.FC = () => {
	const { studyApi } = useStudy();
	const { setIsStepComplete } = useStepCompletion();

	const [age, setAge] = useState<string | null>(null);

	const [gender, setGender] = useState<string | null>(null);
	const [genderText, setGenderText] = useState<string>('');

	const [race, setRace] = useState<Set<string>>(new Set([]));
	const [raceText, setRaceText] = useState<string>('');

	const [country, setCountry] = useState<string | null>(null);
	const [region, setRegion] = useState<string | null>(null);

	const [education, setEducation] = useState<string | null>(null);

	const [submitButtonDisabled, setSubmitButtonDisabled] = useState<boolean>(true);

	useEffect(() => {
		const areBaseFieldsFilled = !!(age && gender && race.size > 0 && country && region && education);
		const isGenderSectionValid = gender !== 'Prefer to self-describe' || genderText !== '';
		const isRaceSectionValid = !race.has('Not listed (Please specify)') || raceText !== '';
		const isFormValid = areBaseFieldsFilled && isGenderSectionValid && isRaceSectionValid;

		setSubmitButtonDisabled(!isFormValid);
	}, [age, gender, genderText, race, raceText, country, region, education]);

	useEffect(() => setRegion(null), [country]);

	const demographicsMutation = useMutation({
		mutationKey: ['Demographics'],
		mutationFn: async () =>
			studyApi.post<Demographic, Demographic>('participants/demographics', {
				age_range: age!,
				gender: gender!,
				gender_other: genderText,
				race: [...race!],
				race_other: raceText,
				education: education!,
				country: country!,
				state_region: region!,
			}),
		onSuccess: () => {
			setSubmitButtonDisabled(true);
			setIsStepComplete(true);
		},
		onError: () => {
			console.error('Something went wrong');
		},
	});

	const countryState = useMemo(() => {
		return Array.from(countryList).reduce((countryMap, country) => {
			countryMap.set(country.name, {
				...country,
				stateProvinces: country.stateProvinces.map((stprov) => stprov.name),
			});
			return countryMap;
		}, new Map<string, CountryItems>());
	}, []);

	const handleRaceSelection = (checked: boolean, raceVal: string) => {
		const newSelection = new Set(race);
		if (checked) {
			newSelection.add(raceVal);
		} else {
			newSelection.delete(raceVal);
		}
		setRace(newSelection);
		if (!newSelection.has('Not listed (Please specify)')) {
			setRaceText('');
		}
	};

	return (
		<div className="mx-auto w-fit text-left m-5 p-5 text-md font-normal w-180 shadow-sm">
			<Field className="mt-5 shadow-sm p-3 rounded">
				<Label className="">What is your age?</Label>
				<Select
					placeholder="Please choose an option"
					onChange={(ageVal) => {
						setAge(ageVal as string);
					}}
				>
					{AGE_OPTIONS}
				</Select>
			</Field>
			<Field className="mt-5 shadow-sm p-3 rounded">
				<Label className="me-5">What is your gender?</Label>
				<div className="flex items-center">
					<Select
						placeholder="Please choose an option"
						onChange={(genderVal) => {
							setGender(genderVal as string);
						}}
					>
						{GENDER_OPTIONS}
					</Select>
					{gender && gender === 'Prefer to self-describe' && (
						<Input
							value={genderText}
							onChange={(evt) => {
								const newGender = evt.target.value;
								setGenderText(newGender);
								if (newGender !== 'Prefer to self-describe') {
									setGenderText('');
								}
							}}
							type="text"
							className={clsx(
								'rounded-md',
								'p-3 ms-3',
								'rounded-md border-amber-400',
								'shadow-sm focus:border-yellow-500 focus:ring-yellow-500',
								'sm:text-sm font-mono'
							)}
						/>
					)}
				</div>
			</Field>
			<Field className="mt-5 shadow-sm p-3 rounded">
				<Label>Which race or ethnicity do you identify with?</Label>
				{RACE_OPTIONS.map((raceVal, idx) => (
					<div key={raceVal} className="flex items-center mt-2">
						<Checkbox
							id={`raceVal_${idx}`}
							checked={race.has(raceVal)}
							onChange={(checked) => handleRaceSelection(checked, raceVal)}
							className={clsx(
								'group block me-3 size-5 rounded border border-amber-500',
								'bg-white cursor-pointer',
								'shadow-sm focus:border-yellow-500 focus:ring-yellow-500',
								'data-checked:bg-amber-500 data-disabled:cursor-not-allowed',
								'data-disabled:opacity-50 data-checked:data-disabled:bg-gray-500'
							)}
						>
							<svg
								className="stroke-white opacity-0 group-data-checked:opacity-100"
								viewBox="0 0 14 14"
								fill="none"
							>
								<path
									d="M3 8L6 11L11 3.5"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</Checkbox>
						<Label htmlFor={`raceVal_${idx}`}>{raceVal}</Label>
						{raceVal === 'Not listed (Please specify)' && race.has(raceVal) && (
							<Input
								value={raceText}
								onChange={(evt) => setRaceText(evt.target.value)}
								type="text"
								className={clsx(
									'rounded-md',
									'p-2 ms-3',
									'rounded-md border-amber-400',
									'shadow-sm focus:border-yellow-500 focus:ring-yellow-500',
									'sm:text-sm font-mono'
								)}
							/>
						)}
					</div>
				))}
			</Field>
			<Field className="mt-5 shadow-sm p-3 rounded">
				<Label className="me-5">What is the highest degree or level of education you have completed?</Label>
				<Select
					placeholder="Please choose an option"
					onChange={(edValue) => {
						setEducation(edValue as string);
					}}
				>
					{EDUCATION_OPTIONS}
				</Select>
			</Field>
			<Field className="mt-5 shadow-sm p-3 rounded">
				<Label className="me-5">Where do you currently reside?</Label>
				<div className="flex items-center">
					<Select
						placeholder="Please choose an option"
						onChange={(countryVal) => setCountry(countryVal as string)}
					>
						{[...countryState.keys()]}
					</Select>
					{country && (
						<Select
							className="ms-3"
							placeholder="Please choose an option"
							onChange={(regionVal) => {
								setRegion(regionVal as string);
							}}
						>
							{countryState.get(country)?.stateProvinces as string[]}
						</Select>
					)}
				</div>
			</Field>
			<button
				className={clsx(
					'm-5 p-3 rounded-md w-81',
					submitButtonDisabled
						? 'cursor-not-allowed bg-gray-400'
						: 'bg-amber-500 cursor-pointer hover:bg-amber-600'
				)}
				disabled={submitButtonDisabled}
				onClick={() => demographicsMutation.mutateAsync()}
			>
				Submit
			</button>
		</div>
	);
};

export default DemographicsPage;
