import clsx from "clsx";

export const Footer: React.FC = () => {
  return (
    <div
      className={clsx(
        "fixed bottom-0 w-full h-5 mt-3 bg-gray-200 z-50",
        "content-center p-5 text-gray-400 text-left text-xs",
      )}
    >
      <p className="">
        <i>Recommender systems for self actualization</i>
        <span>, Clemson University, Clemson, South Carolina</span>
      </p>
    </div>
  );
};

export default Footer;
