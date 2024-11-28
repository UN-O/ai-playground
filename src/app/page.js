import { Fragment } from "react";
import { getAppHierarchy } from "@/lib/route-utils";

// Components & UI
import { ThemeToggle } from "@/components/common/theme-toggle";
import { WrapperLayout } from "@/components/common/layouts";
import { Anchor, H1, Muted } from "@/components/common/typography";



export default function HomePage() {
    const hierarchy = getAppHierarchy();

    return (
		<main className="py-6 sm:py-16">
			<WrapperLayout width={1200} className="grid gap-y-8">
				<div className="flex flex-wrap items-center gap-y-2 sm:justify-between">
					<div className="space-y-2">
						<H1 className="">AI SDK Playground</H1>
						<Muted>This is a playground of AI SDK 4.0.7 by AIFR. Select a test case to begin.</Muted>
					</div>
					<ThemeToggle />
				</div>
				<div className="grid gap-y-2 font-mono">
					{renderHierarchy(hierarchy)}
				</div>
			</WrapperLayout>
		</main>
    );
}

function renderHierarchy(hierarchy, basePath = "") {
	const keys = Object.keys(hierarchy);

	return keys.map((key, index) => {
		const node = hierarchy[key];
		const isLeaf = !Object.keys(node.children).length;
		const isLastChild = index === keys.length - 1;
		const fullPath = `${basePath}/${key}`;

		return (
			<Fragment key={key}>
				<Muted as="span" className={`${basePath ? "pl-6" : ""} block text-base truncate`}>
					{/* Route Symbol */}
					{basePath ? isLastChild ? "└─ " : "├─ " : ""}

					{/* Route & Description */}
					{isLeaf ? <Anchor href={fullPath}>{key}</Anchor> : key}
					{isLeaf && `: ${node.metadata?.description}`}

					{/* Children */}
					{!isLeaf && <div>{renderHierarchy(node.children, fullPath)}</div>}
				</Muted>
			</Fragment>
		);
	});
}