// Client component
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button"

export function ClientComponent({ children }: any) {
    const [showServerChild, setShowServerChild] = useState(false);

    console.log("ClientComponent Render", Date.now())

    const handleButtonClick = () => {
        console.log("ClientComponent Buttom Click", Date.now())
        setShowServerChild(true);
    };

    return (
        <div className="w-full flex justify-center px-5">
            <div className="place-items-center grid gap-3">
                <Button onClick={handleButtonClick} >Show Fetch Data</Button>
                {/* 按下按鈕後才顯示 ServerChild */}
                {showServerChild && children}
            </div>

        </div>
    );
}
