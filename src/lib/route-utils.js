import fs from "fs";
import path from "path";
import vm from "vm";



export function getAppHierarchy() {
	const routes = getAppRoutes();
	const tree = {};

	routes.forEach(({ path, metadata }) => {
		const pathArray = path.split("/").filter(Boolean);
		let currentLevel = tree;

		pathArray.forEach((part, index) => {
			if (!currentLevel[part]) {
				currentLevel[part] = {
					children: {},
					metadata: index === pathArray.length - 1 ? metadata : null,
				};
			}
			currentLevel = currentLevel[part].children;
		});
	});

	return tree;
}

function getAppRoutes() {
    const appDir = path.join(process.cwd(), "src/app");
    const routes = [];

	function exploreSubDirs(dir, basePath = "") {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

		entries.filter(entry => entry.isDirectory())
			.forEach(entry => {
				const subDir = path.join(dir, entry.name);
				const pageFileJS = path.join(subDir, "page.js");
				const pageFileTSX = path.join(subDir, "page.tsx");
				const layoutFileJS = path.join(subDir, "layout.js");
				const layoutFileTSX = path.join(subDir, "layout.tsx");

				const hasPage = fs.existsSync(pageFileJS) || fs.existsSync(pageFileTSX);
				const hasLayout = fs.existsSync(layoutFileJS) || fs.existsSync(layoutFileTSX);

				const entryPath = isRouteGroup(entry.name) ? basePath : `${basePath}/${entry.name}`;
				if (hasPage) {
					// Only consider layout file for metadata
					let metadata = {};
					if (hasLayout) {
						const layoutFile = fs.existsSync(layoutFileJS) ? layoutFileJS : layoutFileTSX;
						metadata = extractMetadata(layoutFile);
					}

					// Add route to the array
					routes.push({ path: entryPath, metadata });
				}

				// Recursive call
				exploreSubDirs(subDir, entryPath);
		});
	}

	function extractMetadata(layoutFile) {
		try {
			const fileContent = fs.readFileSync(layoutFile, "utf8");
			const metadataMatch = fileContent.match(/export const metadata = ({[\s\S]*?});/);

			if (metadataMatch) {
				const sandbox = {};
				const script = new vm.Script(`metadata = ${metadataMatch[1]}`);
				script.runInNewContext(sandbox);
				return sandbox.metadata;
			}
			return {};
		} catch (error) {
			console.error(`Error extracting metadata from ${layoutFile}: ${error.message}`);
			return {};
		}
	}

	exploreSubDirs(appDir);
	return routes;
}

function isRouteGroup(name) {
	return name.startsWith("(") && name.endsWith(")");
}