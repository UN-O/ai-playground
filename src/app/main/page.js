"use client"

// Components & UI
import Sections from "./sections";
import { ToolsProvider } from './_hooks/tools-provider';



export default function MainPage() {
    return (
        <ToolsProvider>
            <div className="h-svh w-full">
                <Sections />
            </div>
        </ToolsProvider>
    );
}