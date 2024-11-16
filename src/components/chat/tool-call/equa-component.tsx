"use client";

import { useEffect, useState } from "react";
import Plot from "react-plotly.js";


export default function EquaComponent ({ equation }: { equation?: string })  {
    const [data, setData] = useState([]);

    useEffect(() => {
        if (equation) {
            plotEquation(equation);
        }
    }, [equation]);

    // 繪製方程式的圖形
    const plotEquation = (equation: string) => {
        const sanitizedEquation = sanitizeEquation(equation);
        if (!sanitizedEquation) {
            alert("方程式格式錯誤，請檢查輸入。");
            return;
        }

        const xValues: number[] = [];
        const yValues: number[] = [];

        try {
            // 使用 new Function 動態計算 y 值
            const computeY = new Function("x", `return ${sanitizedEquation};`);

            // 生成 x 和 y 的值
            for (let x = -10; x <= 10; x += 0.1) {
                const y = computeY(x);
                if (typeof y === "number" && isFinite(y)) {
                    xValues.push(x);
                    yValues.push(y);
                }
            }

            // 更新繪圖資料
            setData([
                {
                    x: xValues,
                    y: yValues,
                    type: "scatter",
                    mode: "lines",
                    line: { color: "blue" },
                },
            ]);
        } catch (error) {
            console.error("計算 y 值時出錯：", error);
            alert("無法計算 y 值，請檢查方程式格式。");
        }
    };

    // 清理並轉換方程式格式
    const sanitizeEquation = (equation: string): string | null => {
        if (!equation) return null;

        // 移除空白字元，並轉為小寫
        equation = equation.replace(/\s+/g, "").toLowerCase();

        // 支援 y= 和 f(x)= 兩種格式
        const equationPattern = /^(y=|f\(x\)=)?[0-9x+\-*/^().a-z]+$/;
        if (!equation.match(equationPattern)) {
            return null;
        }

        // 替換常見的數學函數
        return equation
            .replace(/^y=|^f\(x\)=/, "") // 移除 y= 或 f(x)=
            .replace(/\^/g, "**") // 替換指數符號
            .replace(/sqrt/g, "Math.sqrt")
            .replace(/log/g, "Math.log")
            .replace(/exp/g, "Math.exp")
            .replace(/sin/g, "Math.sin")
            .replace(/cos/g, "Math.cos")
            .replace(/tan/g, "Math.tan")
            .replace(/(\d)(x)/g, "$1*$2"); // 處理隱含乘法
    };

    // 組件渲染 Plot 圖形
    return (
        <div className="bg-neutral-100 p-4 rounded-md flex-col w-full items-center justify-between">
            <Plot
                data={data}
                layout={{
                    title: "方程式圖形",
                    xaxis: { title: "x", zeroline: true },
                    yaxis: { title: "y", zeroline: true },
                }}
            />
        </div>
    );
};
