// Components & UI
import ChatSection from "./chat-section";
import Script from "next/script";

export const metadata = {
    title: "Tool Result - Chemdoodle plot",
    description: "Draw Chemical Structure by SSC",
};


export default function Page() {
    return (
        <div className="h-svh w-full">
            {/* <link
                rel="stylesheet"
                href="/ChemDoodleWeb-10.0.0/install/ChemDoodleWeb.css"
                type="text/css"
            />
            <Script
                src="/ChemDoodleWeb-10.0.0/install/ChemDoodleWeb.js"
                type="text/javascript"
                strategy="afterInteractive" // 確保在頁面渲染前載入
            />
            <Script src="https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js"
                type='text/javascript'
                strategy='afterInteractive'
            /> */}
            <ChatSection />
        </div>
    );
}