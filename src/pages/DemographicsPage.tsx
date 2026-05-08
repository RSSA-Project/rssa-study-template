import { Field, Label } from '@headlessui/react';
import { useStudy } from '@rssa-project/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { AutoSaveCheckboxGroup } from '../components/AutoSaveCheckboxGroup';
import { AutoSaveSelect } from '../components/AutoSaveSelect';
import LoadingScreen from '../components/loadingscreen/LoadingScreen';
import Select from '../components/Select';
import { useStepCompletion } from '../hooks/useStepCompletion';
import countryList from '../res/country_state.json';

interface DemographicsPageProps {
	iAge: boolean;
	iGender: boolean;
	iRaceEthnicity: boolean;
	iEducation: boolean;
	iCountry: boolean;
	countryState: string | undefined;
	iStateRegion: boolean;
	stateRegionState: string | undefined;
	iUrbanicity: boolean;
}

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

const URBANICITY_OPTIONS = ['Rural', 'Suburban', 'Urban'];

interface Demographic {
	id?: string;
	age_range?: string;
	gender?: string;
	gender_other?: string;
	race?: string[];
	race_other?: string;
	education?: string;
	country?: string;
	state_region?: string;
	urbanicity?: string;
}

type CountryItems = {
	name: string;
	countryCode: string;
	countryCodeAlpha3: string;
	stateProvinces: string[];
};

const DemographicsPage: React.FC<DemographicsPageProps> = ({
	iAge = true,
	iGender = true,
	iRaceEthnicity = true,
	iEducation = true,
	iCountry = true,
	countryState = null,
	iStateRegion = false,
	stateRegionState = null,
	iUrbanicity = false,
}) => {
	const { studyApi } = useStudy();
	const { setIsStepComplete } = useStepCompletion();

	const [age, setAge] = useState<string | null>(null);

	const [gender, setGender] = useState<string | null>(null);
	const [genderText, setGenderText] = useState<string>('');

	const [race, setRace] = useState<Set<string>>(new Set([]));
	const [raceText, setRaceText] = useState<string>('');

	const [country, setCountry] = useState<string | null>(countryState);
	const [region, setRegion] = useState<string | null>(stateRegionState);
	const [urbanicity, setUrbanicity] = useState<string | null>(null);

	const [education, setEducation] = useState<string | null>(null);

	useEffect(() => {
		if (countryState) setCountry(countryState);
	}, [countryState]);

	useEffect(() => {
		if (stateRegionState) setRegion(stateRegionState);
	}, [stateRegionState]);

	useEffect(() => setRegion(null), [country]);

	const upsertMutation = useMutation({
		mutationKey: ['Demographics'],
		mutationFn: async (payload: Partial<Demographic>) => {
			return studyApi.patch<Partial<Demographic>, Demographic>('participants/demographics', payload);
		},
		onError: () => console.error('Failed to auto-save demographics'),
	});

	const { data: existingData, isLoading } = useQuery({
		queryKey: ['Demographics'],
		queryFn: () => studyApi.get<Demographic>('participants/demographics'),
		retry: false,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (existingData) {
			if (existingData.age_range) setAge(existingData.age_range);
			if (existingData.gender) setGender(existingData.gender);
			if (existingData.gender_other) setGenderText(existingData.gender_other);

			if (existingData.race) {
				const raceArray = Array.isArray(existingData.race) ? existingData.race : [];
				setRace(new Set(raceArray));
			}
			if (existingData.race_other) setRaceText(existingData.race_other);

			if (existingData.education) setEducation(existingData.education);
			if (existingData.country) setCountry(existingData.country);
			if (existingData.state_region) setRegion(existingData.state_region);
			if (existingData.urbanicity) setUrbanicity(existingData.urbanicity);
		}
	}, [existingData]);

	useEffect(() => {
		const isAgeValid = !iAge || !!age;
		const isGenderValid = !iGender || (!!gender && (gender !== 'Prefer to self-describe' || !!genderText));
		const isRaceValid =
			!iRaceEthnicity || (race.size > 0 && (!race.has('Not listed (Please specify)') || !!raceText));
		const isEducationValid = !iEducation || !!education;
		const isCountryValid = !iCountry || !!country;
		const isRegionValid = !iStateRegion || !!region;
		const isUrbanicityValid = !iUrbanicity || !!urbanicity;

		const isFormValid =
			isAgeValid &&
			isGenderValid &&
			isRaceValid &&
			isEducationValid &&
			isCountryValid &&
			isRegionValid &&
			isUrbanicityValid;

		setIsStepComplete(isFormValid);
	}, [
		age,
		gender,
		genderText,
		race,
		raceText,
		education,
		country,
		region,
		urbanicity,
		iAge,
		iGender,
		iRaceEthnicity,
		iEducation,
		iCountry,
		iStateRegion,
		iUrbanicity,
		setIsStepComplete,
	]);

	const countryStateMap = useMemo(() => {
		return Array.from(countryList).reduce((countryMap, currentCountry) => {
			countryMap.set(currentCountry.name, {
				...currentCountry,
				stateProvinces: currentCountry.stateProvinces.map((stprov) => stprov.name),
			});
			return countryMap;
		}, new Map<string, CountryItems>());
	}, []);

	if (isLoading) {
		return <LoadingScreen loading={true} message="Loading demographics..." />;
	}

	return (
		<div className="mx-auto text-left m-5 p-5 text-md font-normal w-180 shadow-sm mb-24">
			{iAge && (
				<AutoSaveSelect
					label="What is your age?"
					options={AGE_OPTIONS}
					onSave={(val) => {
						setAge(val);
						upsertMutation.mutate({ age_range: val });
					}}
					initialValue={age}
				/>
			)}

			{iGender && (
				<AutoSaveSelect
					label="What is your gender?"
					options={GENDER_OPTIONS}
					hasOther={true}
					initialValue={gender}
					initialOtherText={genderText}
					onSave={(val, text) => {
						setGender(val);
						setGenderText(text || '');
						upsertMutation.mutate({ gender: val, gender_other: text });
					}}
				/>
			)}

			{iRaceEthnicity && (
				<AutoSaveCheckboxGroup
					label="Which race or ethnicity do you identify with?"
					options={RACE_OPTIONS}
					hasOther={true}
					initialValues={Array.from(race)}
					initialOtherText={raceText}
					onSave={(vals, text) => {
						setRace(new Set(vals));
						setRaceText(text || '');
						upsertMutation.mutate({ race: vals, race_other: text });
					}}
				/>
			)}

			{iEducation && (
				<AutoSaveSelect
					label="What is the highest degree or level of education you have completed?"
					options={EDUCATION_OPTIONS}
					onSave={(val) => {
						setEducation(val);
						upsertMutation.mutate({ education: val });
					}}
					initialValue={education}
				/>
			)}

			{(iCountry || iStateRegion) && (
				<Field className="mt-5 shadow-sm p-3 rounded">
					<Label className="me-5">Where do you currently reside?</Label>
					<div className="flex items-center">
						{iCountry && (
							<Select
								placeholder="Please choose an option"
								onChange={(val) => {
									setCountry(val as string);
									upsertMutation.mutate({ country: val as string });
								}}
								value={country}
							>
								{[...countryStateMap.keys()]}
							</Select>
						)}
						{country && iStateRegion && (
							<Select
								placeholder="Please choose an option"
								onChange={(val) => {
									setRegion(val as string);
									upsertMutation.mutate({ state_region: val as string });
								}}
								value={region}
							>
								{countryStateMap.get(country)?.stateProvinces as string[]}
							</Select>
						)}
					</div>
				</Field>
			)}

			{iUrbanicity && (
				<AutoSaveSelect
					label="How would you describe your location?"
					options={URBANICITY_OPTIONS}
					onSave={(val) => {
						setUrbanicity(val);
						upsertMutation.mutate({ urbanicity: val });
					}}
					initialValue={urbanicity}
				/>
			)}
		</div>
	);
};

export default DemographicsPage;
