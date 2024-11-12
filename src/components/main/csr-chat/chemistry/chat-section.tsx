'use client';

import { useCallback, useState } from 'react';
import { continueConversation } from './actions';
import { CoreMessage, ToolCallPart, ToolResultPart, TextPart, CoreToolMessage } from 'ai';
import { readStreamableValue } from 'ai/rsc';

import ChatRoom from '@/components/chat/chat-room';
import ChatInput from '@/components/chat/chat-input';

// Set max duration for responses
export const maxDuration = 30;

export default function ChatSection() {
    const [messages, setMessages] = useState<CoreMessage[]>([]);
    const [input, setInput] = useState<string>('');

    // useCallback 的目的是避免每次渲染時都重新創建 handleSubmit，從而提升效能。
    // 如果依賴的變數（messages 或 input）不變，則 handleSubmit 不會變更。
    const handleSubmit = useCallback(async () => {
        if (!input) return;

        const inputContent: CoreMessage = { role: 'user', content: [{ type: 'text', text: input }] }
        // 清空輸入框，讓輸入框恢復為空白，準備接收下一次輸入。
        setInput('');

        setMessages((prevMessages) => [...prevMessages, inputContent]);

        const { history, streamValue } = await continueConversation([
            ...messages,
            inputContent,
        ]);

        // 每個片段都可能是 TextPart（文字）或 ToolCallPart（工具呼叫）。
        let textContent: Array<TextPart | ToolCallPart> = [];
        // 保存工具的回傳結果，格式為 ToolResultPart。
        let toolResults: ToolResultPart[] = [];

        try {
            // for await...of 迴圈會在每次迭代中等待 Promise 解析，直到所有片段都處理完畢。
            for await (const part of readStreamableValue(streamValue)) {
                switch (part.type) {
                    // text-delta 表示模型傳回了一個文字片段（textDelta）
                    case 'text-delta': {
                        const lastPart = textContent[textContent.length - 1];
                        if (lastPart && lastPart.type === 'text') {
                            // 把分段傳回的文字拼接在一起
                            lastPart.text += part.textDelta;
                        } else {
                            // 新文字片段作為一個新的 TextPart 物件加入 textContent 中。
                            textContent.push({ type: 'text', text: part.textDelta });
                        }
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

                        toolResults.push(ToolResultPart);
                        break;
                    }
                    case 'step-finish': {
                        break;
                    }
                    case 'error': {
                        console.error('An error occurred:', part);
                        break;
                    }
                }

                setMessages([
                    ...history,
                    { role: 'assistant', content: [...textContent] },
                ]);

                if (toolResults.length > 0) {
                    const toolMessage: CoreToolMessage = {
                        role: 'tool',
                        content: toolResults,
                    };
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        toolMessage,
                    ]);
                }
            }
        } catch (error) {
            console.error("Error in conversation stream:", error);
        }
    }, [messages, input]);
    // useCallback 的第二個參數 [messages, input] 是依賴陣列。
    // 當 messages 或 input 改變時，useCallback 會重新生成 handleSubmit 函數。

    return (
        <ChatRoom messages={messages} setMessages={setMessages} title={"SMILES Generator Chat"}>
            <ChatInput input={input} setInput={setInput} handleSubmit={handleSubmit} />
        </ChatRoom>
    );
}
