"use client";

import { useState } from "react";
import { ChatbotProp } from "./chatbot";
import Plot from "react-plotly.js";
import "@/app/draw-plot/plot.css"

export const ChatComponent = ({ text, input }: { text?: string, input?: string }) => {
    const [showAdvance, setShowAdvance] = useState(false);
    const [data, setData] = useState([]);

    return (
        <div className="bg-neutral-100 p-4 rounded-md flex-col w-full items-center justify-between">
            <div>
                <p>{text}</p>
            </div>
        </div>
    );
};
