'use client'

import { useEffect, useRef, useCallback } from "react"
import { useTools } from '../_hooks/tools-provider'; // 跟前端互動，裡面有 tool action 跟目前 tool 的結果 state
import { useMessageStore } from "./message-store";

import ChatMessage from "./chat-message"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Trash2 } from "lucide-react"



export default function ChatRoom({ title, children, toolResultRender = [] }) {
    const messageOrder = useMessageStore((state) => state.messageOrder);
    const getMessagesAsArray = useMessageStore((state) => state.getMessagesAsArray);
    const clearMessages = useMessageStore((state) => state.clearMessages);

    const { clearTools } = useTools();

    const handleClear = useCallback(() => {
        clearMessages();
        clearTools();
    }, [clearMessages]);

    const scrollAreaRef = useRef(null)

    const scrollToButton = () => {
        scrollAreaRef.current.scrollIntoView(false);
    }

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollToButton();
        }
    }, [messageOrder])

    const handleDownload = () => {
        const content = JSON.stringify(getMessagesAsArray(), null, 2);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-conversation.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="w-full mx-auto h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center w-full">
                    <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleClear}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" onClick={handleDownload}>
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>

                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden pr-3">
                <ScrollArea className="h-full pr-3">
                    <div ref={scrollAreaRef} className="h-full flex justify-center w-full">
                        <div className="max-w-[60rem] w-full gap-2 items-center">
                            {messageOrder.map((id) => (
                                <ChatMessage
                                    key={id}
                                    id={id}
                                    toolResultRender={toolResultRender}
                                />
                            ))}
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="flex justify-between items-center w-full">
                    {children}
                </div>
            </CardFooter>
        </Card>)
}