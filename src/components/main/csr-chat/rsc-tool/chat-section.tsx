'use client';

import { useCallback, useState } from 'react';
import { continueConversation } from './actions';
import { CoreMessage, ToolCallPart, ToolResultPart, TextPart, CoreToolMessage } from 'ai';
import { readStreamableValue } from 'ai/rsc';

import ChatRoom from '@/components/chat/chat-room';
import ChatInput from '@/components/chat/chat-input';
import { e } from 'mathjs';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function ChatSection() {
    const [messages, setMessages] = useState<CoreMessage[]>([]);
    const [input, setInput] = useState<string>('');

    const appendMessage = useCallback((message: CoreMessage) => {
        setMessages((prevMessages) => {
            if (message.role === 'assistant') {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                    return [...prevMessages.slice(0, -1), message];
                }
            }
            return [...prevMessages, message]
        });
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!input) return;

        const inputContent: CoreMessage = { role: 'user', content: [{ type: 'text', text: input }] }

        setInput('');

        setMessages((prevMessages) => [...prevMessages, inputContent]);

        const { streamValue } = await continueConversation([
            ...messages,
            inputContent,
        ]);

        let textContent: Array<TextPart | ToolCallPart> = [];
        let toolResults: ToolResultPart[] = [];

        try {
            for await (const part of readStreamableValue(streamValue)) {
                switch (part.type) {
                    case 'text-delta': {
                        const lastPart = textContent[textContent.length - 1];
                        if (lastPart && lastPart.type === 'text') {
                            lastPart.text += part.textDelta;  // 將新內容追加到現有的 TextPart
                        } else {
                            // 如果沒有現有的 TextPart，則新增一個新的 TextPart
                            textContent.push({ type: 'text', text: part.textDelta });
                        }
                        appendMessage({ role: 'assistant', content: textContent });
                        break;
                    }

                    case 'tool-call': {
                        const toolCallPart: ToolCallPart = {
                            type: 'tool-call',
                            toolCallId: part.toolCallId,
                            toolName: part.toolName,
                            args: part.args,
                        };
                        textContent.push(toolCallPart);
                        appendMessage({ role: 'assistant', content: textContent });
                        break;
                    }
                    case 'tool-result': {
                        const ToolResultPart: ToolResultPart = {
                            type: 'tool-result',
                            toolCallId: part.toolCallId,
                            toolName: part.toolName,
                            result: part.result,
                            isError: false,
                        };

                        textContent = [];

                        const toolMessage: CoreToolMessage = {
                            role: 'tool',
                            content: [ToolResultPart],
                        };

                        appendMessage(toolMessage);

                        toolResults.push(ToolResultPart);
                        break;
                    }
                    case 'step-finish': {
                        // textContent.push({ type: 'text', text: '\n\n' });
                        break;
                    }
                    case 'error': {
                        console.error('An error occurred:', part);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error("Error in conversation stream:", error);
        }
    }, [messages, input]);



    return (
        <ChatRoom messages={messages} setMessages={setMessages} title={"RSC-tool chat room"}>
            <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} />
        </ChatRoom>
    );
}