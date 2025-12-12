import './LoadingScreen.css';

interface LoadingScreenProps {
    loading: boolean;
    message: string;
    byline?: string;
}
const LoadingScreen: React.FC<LoadingScreenProps> = ({ loading, message, byline }) => {
    return (
        <div>
            {loading && (
                <div>
                    <div className="ls-container">
                        <div>
                            {message}
                            <div className="loaderStage">
                                <div className="dot-floating"></div>
                            </div>
                        </div>
                        {byline && <p>{byline}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoadingScreen;
