'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import { responseMessage } from "./server-functions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

import { RenderMarkdown } from "@/utils/rendering"

import DrawingComponent from "./white-board"

export default function AIChatGenerator() {
	const [isPlaying, setIsPlaying] = useState(false)
	const [messages, setMessages] = useState([])

	const scrollAreaRef = useRef(null)

	const handleSubmit = useCallback(async (base64image) => {

		const result = await responseMessage(base64image)

		setMessages((previous) => [...previous, result])
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
		<div className="w-full flex h-full">
			<Card className="w-full max-w-2xl mx-auto h-full flex flex-col">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">AI White Board</CardTitle>
				</CardHeader>
				<CardContent className="flex-grow overflow-hidden">
					<ScrollArea className="h-full pr-4">
						<div ref={scrollAreaRef} className="h-full">
								<div className="p-3 rounded-lg bg-primary text-background mb-4 ">
									<RenderMarkdown>
										{`請使用左側白板進行作答，請問 $ U = -ax^2 + bx^4 $ 的最小值在哪裡，為多少?`}
									</RenderMarkdown>
								</div>
							{messages.map((message, index) => (
								<div key={index} className="flex justify-start mb-4 gap-2">
									<div className="p-3 rounded-lg bg-foreground text-background">
										<RenderMarkdown>
											{message}
										</RenderMarkdown>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
				</CardFooter>
			</Card>
			<DrawingComponent handleSend={handleSubmit} />
		</div>
	)
}