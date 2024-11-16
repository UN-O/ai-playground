import {AI} from "./action";
import React from "react";
import "./plot.css";

export const metadata = {
    title: "Draw Plot in ReactNode",
    description: "Draw Plot in RSC return ReactNode by Senba",
};


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <AI>
            {children}
        </AI>
    )
}
