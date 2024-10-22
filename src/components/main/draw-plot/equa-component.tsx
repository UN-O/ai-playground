"use client";

import { useState } from "react";
import { EquationProp } from "./equation";
import Plot from "react-plotly.js";
import "@/app/draw-plot/plot.css"

export const EquaComponent = ({ eqution, input }: { eqution?: EquationProp, input?: string }) => {
    const [showAdvance, setShowAdvance] = useState(false);
    const [data, setData] = useState([]);

    const plotEquation = (equation) => {
        const sanitizedEquation = sanitizeEquation(equation);
        const xValues = [];
        const yValues = [];

        const computeY = new Function('x', `
        return ${sanitizedEquation.replace('y=', '')};
    `);

        for (let x = -10; x <= 10; x += 0.1) {
            const y = computeY(x);
            xValues.push(x);
            yValues.push(y);
        }

        setData([{ x: xValues, y: yValues, type: 'scatter', mode: 'lines' }]);
    };


    const sanitizeEquation = (equation) => {
        const equationPattern = /(y\s*=\s*[0-9xX+\-*/^().]+|f\s*\(x\)\s*=\s*[0-9xX+\-*/^().]+)/i;
        const match = equation.match(equationPattern);

        if (match) {
            const sanitizedEquation = match[0]
                .replace(/\^/g, '**')
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/log/g, 'Math.log')
                .replace(/exp/g, 'Math.exp')
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan');

            return sanitizedEquation.replace(/(\d)(x)/g, '$1*$2');
        } else {
            return null;
        }
    };


    return (
        <div className="bg-neutral-100 p-4 rounded-md flex-col w-full items-center justify-between">
            <p>{eqution?.intro}</p>
            {showAdvance && <Plot data={data} layout={{ title: '方程式圖形' }} />}
            <p>{showAdvance && eqution?.detail}</p>
            {!showAdvance && <button
                onClick={() => setShowAdvance(true)}
            >
                <div className="advance_button" onClick={() => {
                    plotEquation(input)
                }}>進階圖形介紹
                </div>
            </button>}
        </div>
    );
};
