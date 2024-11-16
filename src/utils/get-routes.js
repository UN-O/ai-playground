import fs from "fs";
import path from "path";

export function getRoutes() {
    const appDir = path.join(process.cwd(), "src/app");
    const routes = [];

    function findMetadata(dir, baseRoute = "") {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        entries.forEach((entry) => {
            if (entry.isDirectory()) {
                const subDir = path.join(dir, entry.name);

                // Ignore route groups, e.g., (non)
                const cleanBaseRoute = entry.name.startsWith("(") && entry.name.endsWith(")")
                    ? baseRoute
                    : `${baseRoute}/${entry.name}`;

                // Check for either `page.js` or `page.tsx`
                const pageFileJs = path.join(subDir, "page.js");
                const pageFileTsx = path.join(subDir, "page.tsx");
                const layoutFileJs = path.join(subDir, "layout.js");
                const layoutFileTsx = path.join(subDir, "layout.tsx");

                const hasPage = fs.existsSync(pageFileJs) || fs.existsSync(pageFileTsx);
                const hasLayout = fs.existsSync(layoutFileJs) || fs.existsSync(layoutFileTsx);

                if (hasPage) {
                    const pageFile = fs.existsSync(pageFileJs) ? pageFileJs : pageFileTsx;


                    try {
                        // Read the file content to parse `metadata`
                        const fileContent = fs.readFileSync(pageFile, "utf8");

                        // Extract metadata
                        let metadataMatch = fileContent.match(/export const metadata = ({[\s\S]*?});/);


                        if (hasLayout) {
                            const layoutFile = fs.existsSync(layoutFileJs) ? layoutFileJs : layoutFileTsx;
                            if (!metadataMatch && layoutFile) {
                                const fileContentLayout = fs.readFileSync(layoutFile, "utf8");
                                metadataMatch = fileContentLayout.match(/export const metadata = ({[\s\S]*?});/);
                            }
                        }

                        let metadata = {};
                        if (metadataMatch) {
                            metadata = new Function(`return ${metadataMatch[1]}`)(); // Safely parse the metadata object
                        }

                        routes.push({
                            path: cleanBaseRoute || "/",
                            metadata: metadata || {},
                        });
                    } catch (error) {
                        console.error(`Error parsing metadata for ${pageFile}:`, error.message);
                    }
                }

                findMetadata(subDir, cleanBaseRoute);
            }
        });
    }

    findMetadata(appDir);
    return routes;
}
