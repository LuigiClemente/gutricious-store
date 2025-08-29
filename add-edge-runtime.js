import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of all route files to update
const routeFiles = [
	"./src/app/[channel]/(main)/cart/page.tsx",
	"./src/app/[channel]/(main)/categories/[slug]/page.tsx",
	"./src/app/[channel]/(main)/collections/[slug]/page.tsx",
	"./src/app/[channel]/(main)/login/page.tsx",
	"./src/app/[channel]/(main)/orders/page.tsx",
	"./src/app/[channel]/(main)/products/[slug]/page.tsx",
	"./src/app/[channel]/(main)/products/page.tsx",
	"./src/app/[channel]/(main)/pages/[slug]/page.tsx",
	"./src/app/[channel]/(main)/search/page.tsx",
	"./src/app/checkout/page.tsx",
	"./src/app/api/draft/disable/route.ts",
	"./src/app/api/draft/route.ts",
];

// Process each file
routeFiles.forEach((filePath) => {
	const fullPath = path.resolve(filePath);

	if (fs.existsSync(fullPath)) {
		let content = fs.readFileSync(fullPath, "utf8");

		// Only add if it doesn't already have the runtime config
		if (!content.includes("export const runtime = 'edge'")) {
			// Find the first import statement
			const importRegex = /import.*?;/;
			const importMatch = content.match(importRegex);

			if (importMatch) {
				// Insert after the last import statement
				const lastImportIndex = content.lastIndexOf(";", content.lastIndexOf("import"));
				const updatedContent =
					content.slice(0, lastImportIndex + 1) +
					"\n\nexport const runtime = 'edge';" +
					content.slice(lastImportIndex + 1);

				fs.writeFileSync(fullPath, updatedContent);
				console.log(`Added Edge Runtime to ${filePath}`);
			} else {
				// Add to the top of the file
				const updatedContent = "export const runtime = 'edge';\n\n" + content;
				fs.writeFileSync(fullPath, updatedContent);
				console.log(`Added Edge Runtime to ${filePath}`);
			}
		} else {
			console.log(`Edge Runtime already exists in ${filePath}`);
		}
	} else {
		console.log(`File not found: ${filePath}`);
	}
});

console.log("Completed adding Edge Runtime configuration to all route files.");
