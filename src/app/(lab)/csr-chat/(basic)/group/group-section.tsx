'use client';

import { useCallback, useState } from 'react';
import { Message, continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';

import ChatRoom from '@/components/chat/chat-room';
import ChatInput from '@/components/chat/chat-input';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
// TODO: 這裡來試試看 suspend 等 react 19 的新功能
export default function GroupSection() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');

    const handleSubmit = useCallback(async () => {
        if (!input) {
            return;
        }
        setMessages([
            ...messages, 
            { role: 'user', content: input }
        ]);

        const { history, streamValue } = await continueConversation([
            ...messages,
            { role: 'user', content: input },
        ]);

        setInput('');

        let textContent = '';

        for await (const delta of readStreamableValue(streamValue)) {
            let parts = delta.split("．");

            while (parts.length > 0) {
                let part = parts.shift();
                if (part !== undefined) {
                    textContent = `${textContent}${part}`;

                    if (parts.length > 0) {
                        setMessages((prevMessages) => [
                            ...prevMessages,
                            { role: 'assistant', content: textContent },
                        ]);

                        textContent = '';
                        const randomDelay = Math.floor(Math.random() * 1500) + 500;
                        await new Promise(resolve => setTimeout(resolve, randomDelay));
                    }
                }
            }
        }

        if (textContent) {
            setMessages((prevMessages) => [
                ...prevMessages,
                {role: 'assistant', content: textContent},
            ]);
        }
    }, [messages, input]);


    return (
        <ChatRoom messages={messages} setMessages={setMessages} title={"rsc-group chat room"}>
            <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit}/>
        </ChatRoom>
    );
}