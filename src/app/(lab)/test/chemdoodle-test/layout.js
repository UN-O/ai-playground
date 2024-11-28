import Script from "next/script";

// Metadata
export const metadata = {
    title: "ChemDoodle Test",
    description: "",
};



export default function Layout({ children }) {
	return (
		<>
			<link
				rel="stylesheet"
				href="/ChemDoodleWeb-10.0.0/install/ChemDoodleWeb.css"
				type="text/css"
			/>
			<Script
				src="/ChemDoodleWeb-10.0.0/install/ChemDoodleWeb.js"
				type="text/javascript"
				strategy="beforeInteractive"  // 確保在頁面渲染前載入
			/>
			{children}
		</>
	);
}