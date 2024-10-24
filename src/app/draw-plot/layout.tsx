import {AI} from "@/components/main/draw-plot/action";
import React from "react";
import "./plot.css";

export const metadata = {
    title: 'Next.js',
    description: 'Generated by Next.js',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <center>
        <AI>
            {children}
        </AI>
        </center>
        </body>
        </html>
    )
}
