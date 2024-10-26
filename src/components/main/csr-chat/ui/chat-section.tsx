'use client';

import { useChat } from 'ai/react';

import ChatRoom from '@/components/chat/chat-room';
import ChatInput from '@/components/chat/chat-input';

export default function ChatSection() {
    const { messages, input, setInput, handleSubmit, setMessages } = useChat();

    return (
        <ChatRoom messages={messages} setMessages={setMessages} title={"useChat chat room"}>
            <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit}/>
        </ChatRoom>
    );
}