import { getRoutes } from "@/utils/get-routes";

// Components & UI
import { ThemeToggle } from "@/components/common/theme-toggle";
import { WrapperLayout } from "@/components/common/layouts";
import { Anchor, H1, Muted } from "@/components/common/typography";



export default function HomePage() {
    const routes = getRoutes();
    const hierarchy = buildHierarchy(routes);

	console.log(hierarchy);

    return (
		<main className="py-6 sm:py-16">
			<WrapperLayout width={1000} className="grid gap-y-4">
				<div className="space-y-2">
					<H1 className="">AI SDK Playground</H1>
					<Muted>This is a playground of AI SDK 4.0.7 by AIFR, select a test case to begin.</Muted>
				</div>
				<ThemeToggle />
				{renderHierarchy(hierarchy)}
			</WrapperLayout>
		</main>
    );
}

// 構建樹狀結構
function buildHierarchy(routes) {
    const tree = {};

    routes.forEach(({ path, metadata }) => {
        const parts = path.split("/").filter((part) => part);
        let currentLevel = tree;

        parts.forEach((part, index) => {
            if (!currentLevel[part]) {
                currentLevel[part] = {
                    children: {},
                    metadata: index === parts.length - 1 ? metadata : null, // 最後一層保存 metadata
                };
            }
            currentLevel = currentLevel[part].children;
        });
    });

    return tree;
}

// 遞歸渲染層級結構
function renderHierarchy(tree, basePath = "", isLast = false, depth = 0) {
    const keys = Object.keys(tree);

    return keys.map((key, idx) => {
        const node = tree[key];
        const isLeaf = !Object.keys(node.children).length;
        const isLastChild = idx === keys.length - 1;
        const fullPath = `${basePath}/${key}`; // 構建完整路徑

        return (
            <div key={fullPath} className="font-mono text-sm">
                {/* 顯示當前層的項目 */}
                <div className="flex items-center">
                    {/* 使用 ├─ 或 └─ */}
					{depth > 0 && (
						<Muted className="w-fit">
							{isLastChild ? "└─" : "├─"}
						</Muted>
					)}
					{!isLeaf ? (
						<Muted className="font-bold">{key}</Muted>
					) : (
						<div className="flex space-x-2 w-full place-items-center">
							<Anchor
								href={fullPath} // 使用完整路徑
								className="text-white hover:underline w-32 truncate"
							>
								{key}
							</Anchor>
							{node.metadata?.description && (
								<Muted className="w-full truncate capitalize">
									: {node.metadata.description}
								</Muted>
							)}

						</div>
					)}
                </div>

                {/* 遞歸渲染子節點 */}
                {!isLeaf && (
                    <div className="pl-6 w-full">
                        {renderHierarchy(node.children, fullPath, isLastChild, depth + 1)}
                    </div>
                )}
            </div>
        );
    });
}