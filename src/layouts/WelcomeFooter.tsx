import clsx from "clsx";

export const WelcomeFooter: React.FC<{
  onStudyStart: () => void;
  onStudyContinue: (showForm: boolean) => void;
  disabled?: boolean;
  text?: string;
  loading?: false;
}> = ({
  onStudyStart,
  onStudyContinue,
  disabled = false,
  text = "Next",
  loading = false,
}) => {
  return (
    <div className="h-27 bg-gray-200 rounded-lg mt-3 content-center p-6">
      <div className="float-end">
        <button
          className={clsx(
            "p-3 me-2 rounded-md",
            "fw-normal",
            disabled
              ? "bg-gray-400 text-gray-500 cursor-not-allowed"
              : "bg-amber-400 hover:bg-amber-600 text-gray-500 hover:text-gray-100 cursor-pointer",
          )}
          onClick={() => onStudyContinue(true)}
        >
          Continue a previous session
        </button>
        <button
          className={clsx(
            "p-3 rounded-md",
            "fw-normal",
            disabled
              ? "bg-gray-400 text-gray-500 cursor-not-allowed"
              : "bg-amber-500 hover:bg-amber-600 text-gray-800 hover:text-gray-100 cursor-pointer",
          )}
          onClick={onStudyStart}
          disabled={disabled}
        >
          <span>{!loading ? text : "Loading..."}</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeFooter;
