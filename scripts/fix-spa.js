import { mkdir, copyFile } from "node:fs/promises";
import { join } from "node:path";

// Define our routes that need index.html
const routes = ["calculator", "calculator/resistor", "calculator/ohms"];

// Path to the build directory
const buildDir = "./build/client";

async function copyIndexForRoutes() {
  for (const route of routes) {
    // Create the directory for the route
    const routeDir = join(buildDir, route);
    await mkdir(routeDir, { recursive: true });

    // Copy index.html to the route directory
    await copyFile(join(buildDir, "index.html"), join(routeDir, "index.html"));

    console.log(`✓ Copied index.html to ${route}`);
  }
}

// Run the script
copyIndexForRoutes().catch(console.error);
