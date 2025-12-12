export interface RatedItem {
    id?: string;
    item_id: string;
    rating: number;
    version?: number;
}

export interface MovieEmotions {
    id: string;
    movie_id: string;
    movielens_id: string;

    anger: number;
    anticipation: number;
    disgust: number;
    fear: number;
    joy: number;
    surprise: number;
    sadness: number;
    trust: number;
}

export interface MovieRecommendationText {
    movie_id: string;
    formal: string;
    informal: string;
    source: string | null;
    model: string | null;
    created_at: string;
    updated_at: string;
}

export interface Movie {
    id: string;
    imdb_id: string | null;
    tmdb_id: string | null;
    movielens_id: string;

    title: string;
    year: number;
    ave_rating: number;

    imdb_avg_rating: number | null;
    imdb_rate_count: number | null;

    tmdb_avg_rating: number | null;
    tmdb_rate_count: number | null;

    genre: string;
    director: string | null;
    cast: string;
    description: string;
    poster: string;
    tmdb_poster: string;
    poster_identifier: string;
}

export interface EmotionMovies extends Movie, MovieEmotions { }
export interface MovieRecommdantions extends Movie, MovieRecommendationText { }

export interface MovieDetails extends Movie {
    emotions: MovieEmotions | null;
    recommendations_text: MovieRecommendationText | null;
}

export interface Page {
    id: string;
    step_id: string;
    study_id: string;

    order_position: number;
    next: string | null;

    page_type?: string;

    title?: string;
    instructions?: string;

    last_page: boolean;
}

export interface NavigationWrapper<T> {
    data: T;
    next_id: string | null;
    next_path: string | null;
}

export interface StudyStep {
    id: string;
    study_id: string;

    name: string;
    description: string;

    order_position: number;
    next: string | null;

    step_type: string;
    path: string;

    title: string;
    instructions: string;

    pages?: Page[];
    survey_api_root?: string;
    root_page_info?: NavigationWrapper<SurveyPageType>;
}

export interface SurveyConstructItem {
    id: string;
    survey_construct_id: string;
    display_name: string;
    order_position: number;
}
export interface ScaleLevel {
    id: string;
    survey_scale_id: string;
    display_name: string;
    value: number;
    order_position: number;
}

export interface PageContent {
    id: string;
    study_step_page_id: string;
    preamble: string;
    survey_construct_id: string;
    items: SurveyConstructItem[];
    scale_levels: ScaleLevel[];
    display_name: string;
}

export interface SurveyPageType {
    id: string;
    description: string;
    order_position: number;
    study_step_page_contents: PageContent[];
    next: string;
}

export interface StudyResponseMetaFields {
    step_id: string;
    page_id?: string;
    construct_id?: string;
    construct_name?: string;
}

export interface SurveyItemResponse {
    id: string;
    survey_item_id: string;
    survey_scale_level_id: string;
    version?: number;
}

export interface ParticipantRatingPayload {
    study_step_id: string;
    study_step_page_id: string | null;
    context_tag: string;
    rated_item: RatedItem;
}

export interface ParticipantRatingResponse {
    id: string;
    study_step_id: string;
    study_step_page_id: string | null;
    context_tag: string;
    rated_item: RatedItem;
    version: number;
}
