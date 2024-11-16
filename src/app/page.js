import Image from "next/image";
import Link from "next/link";
import { getRoutes } from "@/utils/get-routes";

const ROUTECASES = [
    {
        title: 'CASE 1 : AI-Core generate text + Bots chat each other',
        route: '/core-lab'
    },
    {
        title: 'CASE 2 : AI math draw plot',
        route: '/draw-plot'
    },
    {
        title: 'CASE 3 : AI-rsc StreamableValue multi-step math agent',
        route: '/csr-chat/rsc'
    }
];

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
            <div key={fullPath} className={`relative ${depth === 0 ? "max-w-md md:max-w-lg lg:max-w-full":"w-full"}`}>
                {/* 顯示當前層的項目 */}
                <div className="flex items-start w-full">
                    {/* 使用 ├─ 或 └─ */}
                    <div className={`w-fit text-stone-700`}>
                        {depth > 0 ? (isLastChild ? "└─" : "├─") : ""}
                    </div>
                    <div className="pl-2 w-full">
                        {!isLeaf ? (
                            <div className="font-bold text-stone-600">{key}</div>
                        ) : (
                            <div className="flex space-x-2 w-full place-items-center">
                                <a
                                    href={fullPath} // 使用完整路徑
                                    className="text-white hover:underline w-32 truncate"
                                >
                                    {key}
                                </a>
                                {node.metadata?.description && (
                                    <div className="w-full text-stone-800 font-[family-name:var(--font-geist-mono)] text-sm truncate capitalize">
                                        : {node.metadata.description}
                                    </div>
                                )}
                                
                            </div>
                        )}
                    </div>
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

export default function Home() {
    const routes = getRoutes()
    const hierarchy = buildHierarchy(routes);

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] w-screen">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full">
                <div className="text-2xl font-bold text-center">AI SDK playground</div>
                <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                    This is a playground of ai sdk 3.4.0 by AIFR, select the test case to begin.
                </ol>
                <div className="grid gap-4 font-mono w-full">
                    {renderHierarchy(hierarchy)}
                </div>
            </main>
        </div>
    );
}
