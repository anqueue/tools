import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join, parse } from "node:path";

const buildDir = "./build/client";
const routesDir = "./app/routes";

async function getRoutes(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const routes = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      const { name, ext } = parse(entry.name);
      // Skip files that start with _ (layout routes) and handle the rest
      if (!name.startsWith("_") && (ext === ".tsx" || ext === ".jsx")) {
        // Convert filename to route path
        // calculator.ohms.tsx becomes /calculator/ohms
        // calculator._index.tsx becomes /calculator
        const parts = name.split(".");
        let route = parts
          .filter((part) => part !== "index" && !part.startsWith("_"))
          .join("/");

        if (route) routes.push(route);
      }
    }
  }

  return routes;
}

async function createHtmlRedirect(targetPath, outputPath) {
  const template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>
    // Get the relative path to the root index.html
    const pathToRoot = location.pathname.split('/').slice(1, -1).map(() => '..').join('/') || '.';
    // Fetch the root index.html
    fetch(\`\${pathToRoot}/index.html\`)
      .then(response => response.text())
      .then(html => {
        document.documentElement.innerHTML = html;
        // Update base href if needed
        const base = document.createElement('base');
        base.href = '/';
        document.head.prepend(base);
      });
  </script>
</head>
<body>
  <p>Loading...</p>
</body>
</html>`;

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, template);
}

async function setupSPA() {
  try {
    // Get all routes from the routes directory
    const routes = await getRoutes(routesDir);
    console.log("Found routes:", routes);

    for (const route of routes) {
      const routePath = join(buildDir, route);
      const htmlPath = join(routePath, "index.html");
      const targetPath = join(
        "..".repeat(route.split("/").length),
        "index.html"
      );

      // Create the route directory
      await mkdir(routePath, { recursive: true });

      // Option 1: Create a symlink (uncomment to use)
      /*
      try {
        // Remove existing symlink if it exists
        if (existsSync(htmlPath)) {
          await unlink(htmlPath);
        }
        await symlink(targetPath, htmlPath);
        console.log(`✓ Created symlink for ${route}`);
      } catch (error) {
        console.error(`Failed to create symlink for ${route}:`, error);
      }
      */

      // Option 2: Create an HTML file that fetches from root (default)
      await createHtmlRedirect(targetPath, htmlPath);
      console.log(`✓ Created redirect HTML for ${route}`);
    }
  } catch (error) {
    console.error("Error setting up SPA:", error);
  }
}

// Run the script
setupSPA().catch(console.error);
