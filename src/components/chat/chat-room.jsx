'use client'

import { useEffect, useRef, useCallback } from "react"

import ChatMessage from "@/components/chat/chat-message"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Trash2 } from "lucide-react"



export default function ChatRoom({ messages, setMessages, title, children }) {
    const scrollAreaRef = useRef(null)

    const handleClear = useCallback(() => {
        setMessages([])
    }, [])

    const scrollToButton = () => {
        scrollAreaRef.current.scrollIntoView(false);
    }

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollToButton();
        }
    }, [messages])

    const handleDownload = useCallback(() => {
        const content = JSON.stringify(messages, null, 2);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-conversation.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [messages]);

    return (
        <Card className="w-full max-w-2xl mx-auto h-full flex flex-col">
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
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div ref={scrollAreaRef} className="h-full">
                        {messages.map((message, index) => (
                            <ChatMessage message={message} index={index} />
                        ))}
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