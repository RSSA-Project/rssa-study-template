interface ParagraphProps {
	children: string;
}
export const PCallout = ({ children }: ParagraphProps) => <h3 className="my-3 text-lg font-bold">{children}</h3>;
export const PSubhead = ({ children }: ParagraphProps) => <h3 className="mt-3 font-semibold">{children}</h3>;
export const PVSpaced = ({ children }: ParagraphProps) => <p className="my-3">{children}</p>;

interface ListProps {
	children: string[];
}
export const NumberedList = ({ children }: ListProps) => (
	<ol className="mt-3 mb-3">
		{children.map((child, idx) => (
			<li key={idx} className="p-1 list-decimal list-inside">
				{child}
			</li>
		))}
	</ol>
);
