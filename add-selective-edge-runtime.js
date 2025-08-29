import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of dynamic routes that should use Edge Runtime
const routeFiles = [
	"./src/app/[channel]/(main)/cart/page.tsx",
	"./src/app/[channel]/(main)/login/page.tsx",
	"./src/app/[channel]/(main)/orders/page.tsx",
	"./src/app/[channel]/(main)/search/page.tsx",
	"./src/app/api/draft/disable/route.ts",
	"./src/app/api/draft/route.ts",
];

// API routes always need Edge Runtime for Cloudflare
const apiRouteFiles = fs
	.readdirSync("./src/app/api", { recursive: true })
	.filter((file) => file.endsWith("route.ts") || file.endsWith("route.tsx"))
	.map((file) => `./src/app/api/${file}`);

// Combine the routes
const allRoutes = [...new Set([...routeFiles, ...apiRouteFiles])];

console.log("Adding Edge Runtime to routes:");

// Process each file
allRoutes.forEach((filePath) => {
	try {
		const fullPath = path.resolve(filePath);

		if (fs.existsSync(fullPath)) {
			const content = fs.readFileSync(fullPath, "utf8");

			// Skip files that have Static Generation
			if (content.includes("generateStaticParams")) {
				console.log(`Skipping ${filePath} - uses generateStaticParams`);
				return;
			}

			// Only add if it doesn't already have the runtime config
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
					console.log(`✓ Added Edge Runtime to ${filePath}`);
				} else {
					// Add to the top of the file
					const updatedContent = "export const runtime = 'edge';\n\n" + content;
					fs.writeFileSync(fullPath, updatedContent);
					console.log(`✓ Added Edge Runtime to ${filePath}`);
				}
			} else {
				console.log(`✓ Edge Runtime already exists in ${filePath}`);
			}
		} else {
			console.log(`File not found: ${filePath}`);
		}
	} catch (error) {
		console.error(`Error processing ${filePath}:`, error);
	}
});

// Now, let's remove Edge Runtime from files with generateStaticParams
const staticGenFiles = [
	"./src/app/[channel]/(main)/products/[slug]/page.tsx",
	"./src/app/[channel]/layout.tsx",
	"./src/app/[channel]/(main)/categories/[slug]/page.tsx",
	"./src/app/[channel]/(main)/collections/[slug]/page.tsx",
	"./src/app/[channel]/(main)/pages/[slug]/page.tsx",
];

console.log("\nRemoving Edge Runtime from Static Generation routes:");

staticGenFiles.forEach((filePath) => {
	try {
		const fullPath = path.resolve(filePath);

		if (fs.existsSync(fullPath)) {
			let content = fs.readFileSync(fullPath, "utf8");

			// Remove Edge Runtime if it exists
			if (content.includes("export const runtime = 'edge'")) {
				content = content.replace(/export\s+const\s+runtime\s+=\s+'edge';\s*\n*/g, "");
				fs.writeFileSync(fullPath, content);
				console.log(`✓ Removed Edge Runtime from ${filePath}`);
			} else {
				console.log(`✓ No Edge Runtime in ${filePath}`);
			}
		} else {
			console.log(`File not found: ${filePath}`);
		}
	} catch (error) {
		console.error(`Error processing ${filePath}:`, error);
	}
});

console.log("\nCompleted updating Edge Runtime configuration for all routes.");
