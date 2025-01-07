'use client';
// hooks
import { useTransition, useCallback, useEffect } from 'react';
import { useConversationManager } from '../_utils/manager';

// zustand
import { useToolsStore } from '../_utils/tools-store'; // 跟前端互動，裡面有 tool action 跟目前 tool 的結果 state
import { useMessagesStore } from "../_utils/messages-store"; // 主要處理儲存訊息，以及處理訊息順序的方法
import { useChatStore } from '../_utils/chat-store';

// actions
import { continueConversation, generateGreetings } from './actions';

// ai
import { recieveStream } from '../_utils/stream-reciever';
import { CoreMessage } from 'ai';

// Components & UI
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

	const submitInput = useMessagesStore((state) => state.submitInput);

	const { openBlock } = useToolsStore();

	const { executeConversation } = useConversationManager();

	const handleSubmit = useCallback(async () => {
		const inputMessage = await submitInput();

		if (inputMessage) {
			executeConversation([inputMessage]);
		}
	}, []);

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