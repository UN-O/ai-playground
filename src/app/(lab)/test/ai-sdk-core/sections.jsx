'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import { responseMessage } from "./server-functions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Download, Pause, Play, Trash2 } from "lucide-react"

export default function AIChatGenerator() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [messages, setMessages] = useState([
        "Hello! I'm AI A. ",
        "Greetings! I'm AI B."
    ])
    const scrollAreaRef = useRef(null)

    const handleSubmit = useCallback(async () => {
        const text = await responseMessage(messages)
        setMessages((previous) => [...previous, text])
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

    useEffect(() => {
        if (isPlaying) {
            handleSubmit();
        }
        if (scrollAreaRef.current) {
            scrollToButton();
        }
    }, [isPlaying, messages.length, handleSubmit])

    return (
        <Card className="w-full max-w-2xl mx-auto h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">AI Chat Generator</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div  ref={scrollAreaRef} className="h-full">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-start space-x-4 mb-4 ${index % 2 === 0 ? "justify-start pr-48" : "justify-end pl-14"
                                    }`}
                            >
                                {index % 2 === 0 ? (
                                    <Avatar className="bg-red-500">
                                        <AvatarFallback className="text-white bg-red-500">A</AvatarFallback>
                                    </Avatar>
                                ) : null}
                                <div
                                    className={`p-3 rounded-lg ${index % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-secondary"
                                        }`}
                                >
                                    <p className="text-sm">{message}</p>
                                </div>
                                {index % 2 !== 0 ? (
                                    <Avatar className="bg-blue-500">
                                        <AvatarFallback className="text-white bg-blue-500">B</AvatarFallback>
                                    </Avatar>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="flex justify-between items-center w-full">
                    <div className="flex gap-2">
                        <Button
                            variant={isPlaying ? "destructive" : "default"}
                            onClick={() => setIsPlaying((previous) => !previous)}
                        >
                            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            {isPlaying ? "Stop" : "Start"}
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