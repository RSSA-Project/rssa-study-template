import DOMPurify from "dompurify";
import parse from "html-react-parser";

export const Header: React.FC<{ title: string; content: string }> = ({ title, content }) => {
	const clean = DOMPurify.sanitize(content);
	const parsed = parse(clean);

	return (
		<div className="bg-gray-200 rounded-md p-5 mb-3 content-center">
			<h1 className="text-2xl font-bold">{title}</h1>
			<div className="mt-3">{parsed}</div>
		</div>
	);
};

export default Header;
