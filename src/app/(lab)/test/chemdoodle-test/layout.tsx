import Script from 'next/script';

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
                strategy="beforeInteractive" // 確保在頁面渲染前載入
            />
            {children}
        </>
    );
}
