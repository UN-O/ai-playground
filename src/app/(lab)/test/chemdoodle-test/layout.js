import Script from "next/script";

// Metadata
export const metadata = {
    title: "ChemDoodle Test",
    description: "Test ChemDoodle Functionality",
};



export default function Layout({ children }) {
	return (
		<>
			{/* <link
				rel="stylesheet"
				href="/ChemDoodleWeb-10.0.0/install/ChemDoodleWeb.css"
				type="text/css"
			/>
			<Script
				src="/ChemDoodleWeb-10.0.0/install/ChemDoodleWeb.js"
				type="text/javascript"
				strategy="afterInteractive"  // 確保在頁面渲染前載入
			/>
			<Script src="https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js"
                type='text/javascript'
                strategy='afterInteractive'
            /> */}
			{children}
		</>
	);
}