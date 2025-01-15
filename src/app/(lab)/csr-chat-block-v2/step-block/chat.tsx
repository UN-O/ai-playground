'use client';
// hooks
import { useCallback } from 'react';
import { useConversationManager } from '../_utils/manager';

// zustand
import { useToolsStore } from '../_utils/tools-store'; // 跟前端互動，裡面有 tool action 跟目前 tool 的結果 state
import { useMessagesStore } from "../_utils/messages-store"; // 主要處理儲存訊息，以及處理訊息順序的方法

// Components & UI
import BlockSection from '../_components/block-section';
import ChatSection from '../_components/chat-section';
import ChatInput from '../_components/chat-input';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface chatProps {
	selectedText: string;
}

export default function Chat({ selectedText }: chatProps) {
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
		<div className="h-svh overflow-hidden">
			<ResizablePanelGroup direction="horizontal">
				<ResizablePanel>
					<ChatSection title={"專題討論區"}>
						<ChatInput handleSubmit={handleSubmit} selectedText={selectedText} />
					</ChatSection>
				</ResizablePanel>

				{openBlock && (
					<>
						<ResizableHandle withHandle />
						<ResizablePanel>
							<BlockSection executeConversation={executeConversation} />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>
		</div>
	);
}
