'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import { GenerateObjectServer } from "./server-functions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, Pause, Play, Trash2 } from "lucide-react"

export default function AIChatGenerator() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [messages, setMessages] = useState([])

    const scrollAreaRef = useRef(null)

    const handleSubmit = useCallback(async () => {
        const object = await GenerateObjectServer()
        setMessages((previous) => [...previous, JSON.stringify(object)])
    }, [messages])

    const handleClear = useCallback(() => {
        setIsPlaying(false)
        setMessages([])
    }, [])

    const scrollToButton = () => {
        scrollAreaRef.current.scrollIntoView(false);
    }

    const handleDownload = useCallback(() => {
        const content = messages.join('\n\n');
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
                <CardTitle className="text-2xl font-bold text-center">AI Chat Generator</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div  ref={scrollAreaRef} className="h-full">
                        {messages.map((message, index) => (
                            <div key={index} className="flex justify-end mb-4 gap-2">
                                <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                                    {message}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSubmit}
                        >
                            submit
                        </Button>
                        <Button variant="outline" onClick={handleClear}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                    <Button variant="secondary" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            </CardFooter>
        </Card>)
}