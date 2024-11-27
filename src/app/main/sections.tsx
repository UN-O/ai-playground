'use client';

import { useEffect, useCallback, useState } from 'react';
import { readStreamableValue } from 'ai/rsc';
import { CoreMessage, CoreToolMessage, ToolCallPart, ToolResultPart, TextPart } from 'ai';

import { useMessageStore } from "./_components/message-store"; // 主要處理儲存訊息，以及處理訊息順序的方法
import { useTools } from './_hooks/tools-provider'; // 跟前端互動，裡面有 tool action 跟目前 tool 的結果 state
import { continueConversation } from './actions';

import BlockSection from './_components/block-section';
import ChatSection from './_components/chat-section';
import ChatInput from './_components/chat-input';

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"



// Allow streaming responses up to 30 seconds
export const maxDuration = 30;


/*  聊天狀態管理器
    1. 管理有哪些 tool 可以使用
    2. 不同的 scenario 、 stage 預設使用哪些 tool 要抓什麼東西順便丟進去 Action，可以增加Action 的 Props input
    3. 使用者 點選哪則訊息、哪個物件特別去做 reply
    4. 換一個 chatid 
*/
// ! 現在這裡比較像是聊天狀態管理器
export default function Sections() {
    

    const appendMessage = useMessageStore((state) => state.appendMessage);
    const getMessagesAsArray = useMessageStore((state) => state.getMessagesAsArray);
    const submitInput = useMessageStore((state) => state.submitInput);

    // TODO: 將 toolResult 變成分頁，並且不只有 create 的方法，也有 update 的方法
    const { activeResult, executeTool, openBlock, setOpenBlock } = useTools();

    // 要觸發聊天機器人繼續回覆只有這個方法在處理，包含 新增訊息、執行工具、執行對話
    // 這應該可以寫成 hook 來處理耶? 跟 executeTool 類似的方法拉出去
    const executeConversation = useCallback(async (additionalMessages = []) => {

        const objectMessage = (object: any): CoreMessage => ({
            role: 'assistant',
            content: [{ type: 'text', text: `This is the content of block ${JSON.stringify(object)}` }],
        });

        // TODO: 使用者 點選哪則訊息、哪個物件特別去做 reply
        const { streamValue } = await continueConversation([
            ...getMessagesAsArray().slice(0, -1),
            ...(activeResult ? [objectMessage(activeResult)] : []),
            ...additionalMessages,
        ]);

        let textContent: Array<TextPart | ToolCallPart> = [];
        let toolResults: ToolResultPart[] = [];

        (async () => {
            try {
                for await (const part of readStreamableValue(streamValue)) {
                    switch (part.type) {
                        case 'text-delta':
                            const lastPart = textContent[textContent.length - 1];
                            if (lastPart && lastPart.type === 'text') {
                                lastPart.text += part.textDelta; // 將新內容追加到現有的 TextPart
                            } else {
                                // 如果沒有現有的 TextPart，則新增一個新的 TextPart
                                textContent.push({ type: 'text', text: part.textDelta });
                            }
                            appendMessage({ role: 'assistant', content: textContent });
                            break;
                        case 'tool-call':
                            const toolCallPart: ToolCallPart = {
                                type: 'tool-call',
                                toolCallId: part.toolCallId,
                                toolName: part.toolName,
                                args: part.args,
                            };
                            textContent.push(toolCallPart);
                            appendMessage({ role: 'assistant', content: textContent });

                            if (toolCallPart.toolName === 'create_step_block') {
                                setOpenBlock(true);
                                (async () => {
                                    try {
                                        await executeTool('create_step_block', toolCallPart.args, part.toolCallId);
                                    } catch (error) {
                                        console.error('Error in create_step_block tool processing:', error);
                                    }
                                })();
                            }
                            break;
                        case 'tool-result':
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
                        case 'step-finish':
                            console.log('step-finish');
                            break;
                        case 'error':
                            console.error('An error occurred:', part);
                            break;
                    }
                }
            } catch (error) {
                console.error('Error in conversation stream:', error);
            }
        })();
    }, [activeResult, appendMessage, executeTool]);

    const handleSubmit = useCallback(async () => {
        const inputMessage = await submitInput();

        if (inputMessage) {
            await executeConversation([inputMessage]);
        }
    }, [submitInput, executeConversation]);

    return (
        <div className='h-svh overflow-hidden'>
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <ChatSection title={"專題討論區"}>
                        <ChatInput handleSubmit={handleSubmit} />
                    </ChatSection>
                </ResizablePanel>

                {openBlock && <>
                    <ResizableHandle withHandle />

                    <ResizablePanel>
                        <BlockSection executeConversation={executeConversation}/>
                    </ResizablePanel>
                </>}
            </ResizablePanelGroup>

        </div>

    );
}