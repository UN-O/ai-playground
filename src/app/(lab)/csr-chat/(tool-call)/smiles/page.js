// Components & UI
import ChatSection from "./chat-section";
import Script from "next/script";



export default function Page() {
    return (
        <div className="h-svh w-full">
            <link
                rel="stylesheet"
                href="/ChemDoodleWeb-10.0.0/install/ChemDoodleWeb.css"
                type="text/css"
            />
            <Script
                src="/ChemDoodleWeb-10.0.0/install/ChemDoodleWeb.js"
                type="text/javascript"
                strategy="beforeInteractive" // 確保在頁面渲染前載入
            />
            <ChatSection />
        </div>
    );
}