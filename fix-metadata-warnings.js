import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all files with specific extensions in a directory
function findFiles(dir, extensions, filelist = []) {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			filelist = findFiles(filePath, extensions, filelist);
		} else {
			if (extensions.includes(path.extname(file))) {
				filelist.push(filePath);
			}
		}
	});

	return filelist;
}

// Find all TypeScript and TSX files in the src/app directory
const files = findFiles("./src/app", [".ts", ".tsx"]);

// Process each file to fix metadata exports
let filesProcessed = 0;
let filesUpdated = 0;

files.forEach((filePath) => {
	try {
		filesProcessed++;
		const content = fs.readFileSync(filePath, "utf8");

		// Check if the file has a metadata export
		if (content.includes("export const metadata")) {
			// Check if the metadata has viewport, colorScheme, or themeColor properties
			const hasViewport = content.includes("viewport:");
			const hasColorScheme = content.includes("colorScheme:");
			const hasThemeColor = content.includes("themeColor:");

			// If there are no problematic properties, skip this file
			if (!hasViewport && !hasColorScheme && !hasThemeColor) {
				return;
			}

			let updatedContent = content;
			let viewportProperties = [];

			// Extract viewport properties
			if (hasViewport) {
				const viewportMatch = content.match(/viewport:\s*['"]([^'"]+)['"]/);
				if (viewportMatch) {
					const viewportValue = viewportMatch[1];
					// Parse the viewport string into width, initialScale, etc.
					const widthMatch = viewportValue.match(/width=([^,]+)/);
					const initialScaleMatch = viewportValue.match(/initial-scale=([^,]+)/);
					const maximumScaleMatch = viewportValue.match(/maximum-scale=([^,]+)/);

					if (widthMatch) viewportProperties.push(`  width: '${widthMatch[1]}',`);
					if (initialScaleMatch) viewportProperties.push(`  initialScale: ${initialScaleMatch[1]},`);
					if (maximumScaleMatch) viewportProperties.push(`  maximumScale: ${maximumScaleMatch[1]},`);

					// Remove viewport from metadata
					updatedContent = updatedContent.replace(/viewport:\s*['"][^'"]+['"],?\n?/g, "");
				}
			}

			// Extract colorScheme
			if (hasColorScheme) {
				const colorSchemeMatch = content.match(/colorScheme:\s*['"]?([^'"]+)['"]?/);
				if (colorSchemeMatch) {
					const colorSchemeValue = colorSchemeMatch[1];
					viewportProperties.push(`  colorScheme: '${colorSchemeValue}',`);

					// Remove colorScheme from metadata
					updatedContent = updatedContent.replace(/colorScheme:\s*['"]?[^'"]+['"]?,?\n?/g, "");
					updatedContent = updatedContent.replace(/colorScheme:\s*['"]?[^'"]+['"]? as const,?\n?/g, "");
				}
			}

			// Extract themeColor
			if (hasThemeColor) {
				const themeColorMatch = content.match(/themeColor:\s*['"]([^'"]+)['"]/);
				if (themeColorMatch) {
					const themeColorValue = themeColorMatch[1];
					viewportProperties.push(`  themeColor: '${themeColorValue}',`);

					// Remove themeColor from metadata
					updatedContent = updatedContent.replace(/themeColor:\s*['"][^'"]+['"],?\n?/g, "");
				}
			}

			// Add viewport export if we have properties to add
			if (viewportProperties.length > 0) {
				const viewportExport = `export const viewport = {\n${viewportProperties.join("\n")}\n};\n\n`;

				// Find a good place to insert the viewport export (before metadata export)
				const metadataIndex = updatedContent.indexOf("export const metadata");
				if (metadataIndex !== -1) {
					// Insert viewport export before metadata export
					updatedContent =
						updatedContent.slice(0, metadataIndex) + viewportExport + updatedContent.slice(metadataIndex);
				} else {
					// Insert at the top after imports
					const lastImportIndex = updatedContent.lastIndexOf("import");
					const lastImportEndIndex = updatedContent.indexOf(";", lastImportIndex) + 1;

					if (lastImportIndex !== -1) {
						updatedContent =
							updatedContent.slice(0, lastImportEndIndex) +
							"\n\n" +
							viewportExport +
							updatedContent.slice(lastImportEndIndex);
					} else {
						// Just add at the beginning
						updatedContent = viewportExport + updatedContent;
					}
				}

				// Clean up metadata object (remove empty brackets and trailing commas)
				updatedContent = updatedContent.replace(/,(\s*})/g, "$1");
				updatedContent = updatedContent.replace(/{\s*}/g, "{}");

				// Write the updated content back to the file
				fs.writeFileSync(filePath, updatedContent);
				filesUpdated++;
				console.log(`✓ Updated: ${filePath}`);
			}
		}
	} catch (error) {
		console.error(`Error processing ${filePath}:`, error);
	}
});

console.log(
	`\nProcessed ${filesProcessed} files, updated ${filesUpdated} files with metadata warnings fixes.`,
);
