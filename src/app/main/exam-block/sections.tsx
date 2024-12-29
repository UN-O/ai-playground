'use client';

import { useTransition, useCallback, useEffect } from 'react';
import { readStreamableValue } from 'ai/rsc';
import { CoreMessage, CoreToolMessage, ToolCallPart, ToolResultPart, TextPart } from 'ai';

import { StreamableValue } from 'ai/rsc';
import { useToolsStore } from '../_components/tools-store'; // 跟前端互動，裡面有 tool action 跟目前 tool 的結果 state
import { useMessagesStore } from "../_components/messages-store"; // 主要處理儲存訊息，以及處理訊息順序的方法

import { continueConversation, generateGreetings } from './actions';


import { recieveStream } from '../_components/chat-manager';
import BlockSection from '../_components/block-section';
import ChatSection from '../_components/chat-section';
import ChatInput from '../_components/chat-input';
import { Button } from '@/components/ui/button';

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
	const [isPending, startTransition] = useTransition();

	const getMessagesAsArray = useMessagesStore((state) => state.getMessagesAsArray);
	const submitInput = useMessagesStore((state) => state.submitInput);
	const setIsLoading = useMessagesStore((state) => state.setIsLoading);

	// TODO: 將 toolResult 變成分頁，並且不只有 create 的方法，也有 update 的方法
	const { getActiveResult, openBlock } = useToolsStore();

	const executeGreeting = useCallback(() => {
		startTransition(async () => {
			const { streamValue } = await generateGreetings();
			recieveStream(streamValue);
		})
	}, [generateGreetings]);

	useEffect(() => {
		setIsLoading(isPending);
	}, [isPending]);

	// 要觸發聊天機器人繼續回覆只有這個方法在處理，包含 新增訊息、執行工具、執行對話
	// 這應該可以寫成 hook 來處理耶? 跟 executeTool 類似的方法拉出去
	// ? 這是不是應該寫在別的地方??
	const executeConversation = useCallback((additionalMessages = []) => {
		startTransition(async () => {
			const objectMessage = (object: any): CoreMessage => ({
				role: 'assistant',
				content: [{ type: 'text', text: `This is the content of block ${JSON.stringify(object)}` }],
			});

			// TODO: 使用者 點選哪則訊息、哪個物件特別去做 reply
			const { streamValue } = await continueConversation([
				...getMessagesAsArray().slice(0, -1),
				...(getActiveResult ? [objectMessage(getActiveResult)] : []),
				...additionalMessages,
			]);
			recieveStream(streamValue);
		})
	}, [getActiveResult]);

	const handleSubmit = useCallback(async () => {
		const inputMessage = await submitInput();

		if (inputMessage) {
			executeConversation([inputMessage]);
		}
	}, [submitInput, executeConversation]);

	return (
		<div className='h-svh overflow-hidden'>
			<ResizablePanelGroup direction="horizontal">
				<ResizablePanel>
					<ChatSection title={"專題討論區"}>
						{/* <Button onClick={executeGreeting}>Generate Greetings</Button> */}
						<ChatInput handleSubmit={handleSubmit} />
					</ChatSection>
				</ResizablePanel>

				{openBlock && <>
					<ResizableHandle withHandle />

					<ResizablePanel>
						<BlockSection executeConversation={executeConversation} />
					</ResizablePanel>
				</>}
			</ResizablePanelGroup>

		</div>

	);
}