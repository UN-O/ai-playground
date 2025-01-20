// CSS
import "@/app/globals.css";

// Components & UI
import Providers from "@/lib/providers";

// Fonts
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

// Metadata
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields
const title = "AI Playground";
const description = "This is a playground of AI SDK 4.0 from NTHU AIFR.";
export const metadata = {
    title: {
		default: title,
		template: `%s｜${title}`,
	},
    description,
	robots: {
		index: false,
		follow: false,
	},
};



export default function RootLayout({ children }) {
    return (
        <html lang="en-US" suppressHydrationWarning>
			<head>
				{/* The CSS and JS from ChemDoodle */}
				<link
				rel="stylesheet"
				href="/ChemDoodleWeb-10.0.0/install/ChemDoodleWeb.css"
				/>
				<script src="/ChemDoodleWeb-10.0.0/install/ChemDoodleWeb.js" />
				<script src="https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js" />
			</head>
            <body className={`${GeistSans.variable} ${GeistMono.variable} bg-background text-foreground font-sans antialiased`}>
				<Providers>
					{children}
				</Providers>
            </body>
        </html>
    );
}
