"use client"
// Import UI components
import Sections from "./sections";
import { ToolsProvider } from './_hooks/tools-provider';


export default function Page() {
    return (
        <ToolsProvider>
            <div className="h-svh w-full">
                <Sections />
            </div>
        </ToolsProvider>
    );
}