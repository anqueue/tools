import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import "@mantine/core/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
} from "@mantine/core";
import { LinksFunction } from "@remix-run/node";

const theme = createTheme({
  defaultRadius: "sm",
  fontFamily: "Roboto Mono, monospace",

  // Slightly modified dark color palette
  colors: {
    dark: [
      "#A8A8AB",
      "#8E8F93",
      "#787A7F",
      "#4B4E54",
      "#2B2E33",
      "#212326",
      "#1A1B1E",
      "#111213",
      "#0B0C0D",
      "#070809",
    ],
  },
});

export const links: LinksFunction = () => [
  // PWA manifest
  { rel: "manifest", href: "/manifest.webmanifest" },
  // Theme color for browser chrome
  { rel: "icon", type: "image/svg+xml", href: "/icon.svg" },
  // Preconnect to Google Fonts for faster loading
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  // Preload critical font file to prevent FOIT
  {
    rel: "preload",
    href: "https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_S-W4Ep0.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  // Load fonts with display=swap for instant text rendering
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#212326" />
        <title>Engineering Calculator</title>
        <meta name="description" content="Engineering calculators and utilities" />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider
          defaultColorScheme="dark"
          forceColorScheme="dark"
          theme={theme}
        >
          <main>{children}</main>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
