import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes that need to be modified (removing generateStaticParams and adding Edge Runtime)
const routesToModify = [
	"./src/app/[channel]/(main)/products/[slug]/page.tsx",
	"./src/app/[channel]/(main)/categories/[slug]/page.tsx",
	"./src/app/[channel]/(main)/collections/[slug]/page.tsx",
	"./src/app/[channel]/(main)/pages/[slug]/page.tsx",
];

routesToModify.forEach((filePath) => {
	try {
		const fullPath = path.resolve(filePath);

		if (fs.existsSync(fullPath)) {
			let content = fs.readFileSync(fullPath, "utf8");

			// Remove the generateStaticParams function
			const staticParamsRegex = /export\s+async\s+function\s+generateStaticParams[\s\S]*?}\s*\n/;
			content = content.replace(staticParamsRegex, "");

			// Add Edge Runtime if not already present
			if (!content.includes("export const runtime = 'edge'")) {
				// Find the imports
				const lastImportIndex = content.lastIndexOf("import");
				const lastImportEndIndex = content.indexOf(";", lastImportIndex) + 1;

				if (lastImportIndex !== -1) {
					// Add after the last import
					const updatedContent =
						content.slice(0, lastImportEndIndex) +
						"\n\nexport const runtime = 'edge';" +
						content.slice(lastImportEndIndex);

					fs.writeFileSync(fullPath, updatedContent);
					console.log(`✓ Updated ${filePath} to use Edge Runtime`);
				} else {
					// Add to the top of the file
					const updatedContent = "export const runtime = 'edge';\n\n" + content;
					fs.writeFileSync(fullPath, updatedContent);
					console.log(`✓ Updated ${filePath} to use Edge Runtime`);
				}
			} else {
				fs.writeFileSync(fullPath, content);
				console.log(`✓ Updated ${filePath} (removed generateStaticParams)`);
			}
		} else {
			console.log(`File not found: ${filePath}`);
		}
	} catch (error) {
		console.error(`Error processing ${filePath}:`, error);
	}
});

console.log("\nCompleted migration to Edge Runtime for all routes.");
