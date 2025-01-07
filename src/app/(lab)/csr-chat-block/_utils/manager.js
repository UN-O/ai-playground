'use client';
// hooks
import { useTransition, useCallback, useEffect } from 'react';

// actions
import { continueConversation, generateGreetings } from '../step-block/actions';

// zustand
import { useToolsStore } from './tools-store'; // 跟前端互動，裡面有 tool action 跟目前 tool 的結果 state
import { useMessagesStore } from "./messages-store"; // 主要處理儲存訊息，以及處理訊息順序的方法
import { useChatStore } from './chat-store';
import { toolsConfig } from '../_lib/ai/tools-config';

// ai
import { recieveStream, recieveObjectStream } from './stream-reciever';


// manage conversation state and actions
// 這個 hook 主要是用來處理對話機器人的狀態，包含 isLoading、執行對話、執行工具、執行問候語
// TODO: 加入跟資料庫相關的 action 管理與初始化等資訊
export function useConversationManager() {
	const isloading = useChatStore((state) => state.isLoading);
	const { setIsLoading } = useChatStore();

	const getMessagesAsArray = useMessagesStore((state) => state.getMessagesAsArray);
	const submitInput = useMessagesStore((state) => state.submitInput);

	const { getActiveResult, initToolResult } = useToolsStore();

	const [isPendingGreeting, startGreetingTransition] = useTransition();
	const [isPending, startTransition] = useTransition();
	const [isToolPending, startToolTransition] = useTransition();

	useEffect(() => {
		setIsLoading(isPending);
	}, [isPending]);

	// 要觸發聊天機器人繼續回覆只有這個方法在處理，包含 新增訊息、執行工具、執行對話
	// 這應該可以寫成 hook 來處理耶? 跟 executeTool 類似的方法拉出去
	const executeConversation = useCallback((additionalMessages = []) => {
		startTransition(async () => {
			const objectMessage = (object) => ({
				role: 'assistant',
				content: [{ type: 'text', text: `This is the content of block ${JSON.stringify(object)}` }],
			});

			// TODO: 使用者 點選哪則訊息、哪個物件特別去做 reply
			const { streamValue } = await continueConversation([
				...getMessagesAsArray().slice(0, -1),
				...(getActiveResult ? [objectMessage(getActiveResult)] : []),
				...additionalMessages,
			]);
			recieveStream(streamValue, executeTool);
		})
	}, [getActiveResult]);


	const executeGreeting = useCallback(() => {
		startTransition(async () => {
			const { streamValue } = await generateGreetings();
			recieveStream(streamValue, executeTool);
		})
	}, [generateGreetings]);

	const executeTool = useCallback((toolName, args, toolId) => {
		console.log('executeTool', toolName, args, toolId);
		initToolResult(toolName, toolId);
		startToolTransition(async () => {
			const { streamValue } = await toolsConfig[toolName].action(args);
			recieveObjectStream(streamValue, toolName, toolId);
		});
	}, []);

	return {
		executeConversation,
		executeTool,
		executeGreeting,
	};
}