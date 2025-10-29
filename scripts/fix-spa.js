import { readdir, mkdir, copyFile } from "node:fs/promises";
import { join, parse } from "node:path";

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

async function setupSPA() {
  try {
    // Get all routes from the routes directory
    const routes = await getRoutes(routesDir);
    console.log("Found routes:", routes);

    for (const route of routes) {
      // Create the directory for the route
      const routeDir = join(buildDir, route);
      await mkdir(routeDir, { recursive: true });

      // Copy index.html to the route directory
      await copyFile(
        join(buildDir, "index.html"),
        join(routeDir, "index.html")
      );

      console.log(`✓ Copied index.html to ${route}`);
    }
  } catch (error) {
    console.error("Error setting up SPA:", error);
  }
}

// Run the script
setupSPA().catch(console.error);
