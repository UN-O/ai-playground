import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

// Components & UI
import { H1, H2, H3, H4, H5, H6 } from "./typography";

// Constants & Variables
const sectionVariants = cva(
	"",
	{
		variants: {
			titleAs: {
				h1: "py-8",
				h2: "py-6",
				h3: "py-3",
				h4: "py-2",
				h5: "py-1",
				h6: "py-1",
			},
		},
		defaultVariants: {
			titleAs: "h2",
		},
	}
);

const HEADING_MAP = {
	h1: H1,
	h2: H2,
	h3: H3,
	h4: H4,
	h5: H5,
	h6: H6,
};



/**
 * WrapperLayout component to center content with dynamic sizing based on the provided size prop.
 *
 * @param {Object} props - The props for the component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the wrapper.
 * @param {string} [props.className] - Additional class names for custom styling.
 * @param {number} [props.width=1400] - Defines the maximum width of the wrapper in pixels (default is 1400px).
 * @returns {JSX.Element} The rendered wrapper layout with responsive width.
 */
export function WrapperLayout({ children, className, width = 1400 }) {
	return (
		<div
			style={{ "--wrapper-width": `${width}px` }}
			className={cn("mx-auto [--wrapper-padding:_4rem] sm:[--wrapper-padding:_8rem] w-[min(calc(100%_-_var(--wrapper-padding)),_var(--wrapper-width))]", className)}
		>
			{children}
		</div>
	);
}

/**
 * SectionLayout component to render a section with an optional title and customizable heading level.
 *
 * @param {Object} props - The props for the component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the section.
 * @param {string} [props.className] - Additional class names for custom styling.
 * @param {string} [props.title] - The title text to be displayed as a heading.
 * @param {"h1" | "h2" | "h3" | "h4" | "h5" | "h6"} [props.titleAs="h2"] - The heading level to use for the title.
 * @returns {JSX.Element} The rendered section layout.
 */
export function SectionLayout({ children, className, title = "", titleAs = "h2" }) {
	const TitleTag = HEADING_MAP[titleAs] || H2;

	return (
		<section className={cn(sectionVariants({ titleAs, className }))}>
			{title && <TitleTag>{title}</TitleTag>}
			{children}
		</section>
	);
}