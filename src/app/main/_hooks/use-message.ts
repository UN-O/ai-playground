import { useState, useCallback } from 'react';
import { CoreMessage } from 'ai';



interface UseMessage {
    messages: CoreMessage[];
    input: string;
    setMessages: (value: CoreMessage[]) => void;
    setInput: (value: string) => void;
    appendMessage: (message: CoreMessage) => void;
    submitInput: () => Promise<CoreMessage | null>;
}

export function useMessage(): UseMessage {
    const [messages, setMessages] = useState<CoreMessage[]>([]);
    const [input, setInput] = useState<string>('');

    const appendMessage = useCallback((message: CoreMessage) => {
        setMessages((prevMessages) => {
            if (message.role === 'assistant') {
                const lastMessage = prevMessages[prevMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                    // 替換最後一條訊息
                    return [...prevMessages.slice(0, -1), message];
                }
            }
            // 添加新訊息
            return [...prevMessages, message];
        });
    }, []);

    const submitInput = useCallback(async (): Promise<CoreMessage | null> => {
        if (!input) return null;
        const inputMessage: CoreMessage = { role: 'user', content: [{ type: 'text', text: input }] };
        setInput('');
        setMessages((prevMessages) => [...prevMessages, inputMessage]);
        return inputMessage;
    }, [input]);

    return {
        messages,
        input,
        setMessages,
        setInput,
        appendMessage,
        submitInput,
    };
}
