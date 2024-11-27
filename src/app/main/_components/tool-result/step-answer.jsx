import { useState } from 'react';
import { useMessageStore } from '../message-store';

import { RenderMarkdown } from "@/utils/rendering"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Copy, Check } from 'lucide-react';
import { toolsConfig } from '../tools-config';
import { Button } from '@/components/ui/button';

export default function StepAnswer({ result, executeConversation }) {
    const setInput = useMessageStore((state) => state.setInput);

    const appendMessage = useMessageStore((state) => state.appendMessage);

    const handleBug = (index, step) => {
        setInput(`第 ${index} 步驟有問題，你寫的 $${step.latex_formulas}$ ，我覺得...`);
    }

    const handleExplanation = async (index, step) => {
        const inputMessage = {
            role: 'user',
            content: [{ type: 'text', text: `我想更了解第 ${index} 步驟的推導` }],
        };
        const submitMessage = {
            role: 'user',
            content: [{ type: 'text', text: `使用三個段落來進行詳細解釋第 ${index} 步驟的推導，為什麼 "${step.textual_description}"，首先是解釋關鍵概念、再來舉例(生活中的例子或其他淺顯易懂的範例)、最後用 (1)、(2)、(3) 條列摘要，最後詢問我這樣解釋是否能接受(請換句話說並根據解釋的內容變化詢問內容)，並且段落結束時都使用 --- 進行分隔，讓句子口語化好懂，請保持嚴謹的論述，但語氣保持幽默` }],
        };
        appendMessage(inputMessage);
        await executeConversation([submitMessage]);
    }

    result = toolsConfig['create_step_block'].schema.parse(result || {});

    return (
        <div className="w-full">
            {result && <div className='mr-3'>
                <p className="font-mono text-xs uppercase text-stone-500 text-right">calculation steps</p>
                <Accordion type="multiple" className="text-secondary font-mono text-sm p- rounded-lg mb-2 w-full">
                    <div className="w-full space-y-2">
                        {Array.isArray(result?.steps) && result?.steps?.map((step, index) => (
                            <AccordionItem value={`item-${index}`} className="relative w-full bg-stone-800 " key={index}>
                                <div className="grid h-full w-full group border border-stone-700 rounded-md" key={index}>
                                    <AccordionTrigger className="w-full min-h-28">
                                        <div className="w-full h-full grid grid-cols-8 justify-between gap-1">
                                            <div className="col-span-7 w-full h-full flex px-3 place-content-start overflow-x-auto items-center">
                                                <ScrollArea className="w-full h-fit horizontal">
                                                    {/* {step.concept} */}
                                                    {step && <div className="w-fit">
                                                        <RenderMarkdown>
                                                            {"\\[" + step?.latex_formulas + "\\]"}
                                                        </RenderMarkdown>
                                                    </div>}
                                                    <ScrollBar orientation="horizontal" />
                                                </ ScrollArea>
                                            </div>
                                            <div className="col-end-9 font-bold px-2 w-full place-items-center flex justify-end">
                                                ({index + 1})
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <div className="absolute top-3 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transform -translate-y-1/2 transition-opacity duration-200">
                                        <Button
                                            className="bg-gray-500 text-white text-xs rounded hover:bg-gray-700"
                                            onClick={() => handleBug(index + 1, step)}
                                        >
                                            這一步怪怪的?
                                        </Button>
                                        <Button
                                            className="bg-gray-500 text-white text-xs rounded hover:bg-gray-700"
                                            onClick={() => handleExplanation(index + 1, step)}
                                        >
                                            我需要詳細解釋
                                        </Button>
                                        <CopyButton step={step} />

                                    </div>
                                    <AccordionContent>
                                        <div className="p-2 py-6 text-stone-500">
                                            <RenderMarkdown>
                                                {step?.textual_description}
                                            </RenderMarkdown>
                                        </div>
                                    </AccordionContent>
                                </div>
                            </AccordionItem>
                        ))}
                    </div>

                </Accordion>
                <div className="bg-stone-800 font-mono text-sm p-2 rounded text-secondary">
                    <RenderMarkdown>
                        {result?.notification}
                    </RenderMarkdown>
                </div>
            </div>}
        </div>
    );
}


function CopyButton({ step }) {
    const [isCopied, setIsCopied] = useState(false); // 單個按鈕的狀態

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard
            .writeText(text) // 將文本複製到剪貼簿
            .then(() => {
                setIsCopied(true); // 設置按鈕為已複製狀態
                setTimeout(() => setIsCopied(false), 2000); // 3 秒後恢復按鈕狀態
            })
            .catch((err) => console.error("複製失敗", err));
    };

    return (
        <Button
            className="bg-blue-500 text-white text-xs rounded hover:bg-blue-700"
            onClick={() => handleCopy(step?.latex_formulas)}
        >
            {isCopied ? (
                <Check className="w-4 h-4" /> // 已複製狀態顯示 Check 圖標
            ) : (
                <Copy className="w-4 h-4" /> // 初始狀態顯示 Copy 圖標
            )}
        </Button>
    );
}