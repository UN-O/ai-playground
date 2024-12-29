import { useMessagesStore } from './messages-store';
import { useToolsStore } from './tools-store';
import { readStreamableValue, StreamableValue } from 'ai/rsc';
import { CoreMessage, CoreToolMessage, ToolCallPart, ToolResultPart, TextPart } from 'ai';
import { toolsConfig } from './tools-config';


/**
 * 固定時間間隔地「批次處理」呼叫參數。
 * 
 * @param func - 真正用來處理「這段時間內所有呼叫」的函式，接收一個「參數陣列」。
 * @param interval - 多少毫秒後才做一次 flush。
 */
function throttleBuffer<T extends (...args: any[]) => void>(
	func: (bufferedCalls: Parameters<T>[]) => void,
	interval: number
  ) {
	let lastTime = 0;
	let buffer: Parameters<T>[] = [];
  
	// 這裡先做一個「真正的執行」函式
	function flush() {
	  if (buffer.length > 0) {
		func(buffer);
		buffer = [];
	  }
	}
  
	// 回傳的這個函式：用來收集參數 + 每 interval 就 flush
	const throttledFn = (...args: Parameters<T>) => {
	  buffer.push(args);
  
	  const now = Date.now();
	  if (now - lastTime >= interval) {
		lastTime = now;
		flush();
	  }
	};
  
	// 附加一個方法：供外部強制 flush 用
	throttledFn.flush = flush;
  
	return throttledFn;
  }
  



export const recieveObjectStream = async (streamValue: StreamableValue<any, any>, toolName: string, toolCallId: string) => {

	const { schema, type } = toolsConfig[toolName];

	const throttledUpdateResult = throttleBuffer(
		(bufferedCalls: [string, any][]) => {
			// 這裡的 bufferedCalls 是「這一批」收集到的所有呼叫參數
			// 假設你原本 state manager 提供了 updateResult
			const updateResult = useToolsStore.getState().updateResult;

			// 一次處理這批
			for (const [toolCallId, result] of bufferedCalls) {
				updateResult(toolCallId, result);
			}
		},
		50 // interval: 50ms => 大約20fps更新
	);

	const setOpenBlock = useToolsStore.getState().setOpenBlock;

	if (type === 'block') {
		setOpenBlock(true);
	}

	(async () => {
		try {
			for await (const delta of readStreamableValue(streamValue)) {
				const result = schema.parse(delta || {})
				throttledUpdateResult(toolCallId, result);
			}
			throttledUpdateResult.flush();
		} catch (error) {
			console.error('Error in object stream:', error);
		}
	})();
}


export const recieveStream = async (streamValue: StreamableValue<any, any>) => {



	const appendMessage = useMessagesStore.getState().appendMessage;

	// 設定一個比較適合的 interval，假如 50ms => 20次/秒
	const throttledAppend = throttleBuffer(
		(calls: [ CoreMessage[]]) => {
			// 這裡 calls 可能是一批多筆，但大多情況下只需要拿最後一筆即可
			// 也可以選擇全部都 append
			for (const [message] of calls) {
				appendMessage(message);
			}
		},
		20
	);

	const executeTool = useToolsStore.getState().executeTool;

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
						throttledAppend({ role: 'assistant', content: textContent });
						console.log('text-delta', textContent);
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

							(async () => {
								try {
									const { streamValue } = await executeTool(part.toolName, toolCallPart.args, part.toolCallId);

									await recieveObjectStream(streamValue, part.toolName, part.toolCallId);

								} catch (error) {
									console.error('Error in create_step_block tool processing:', error);
								}
							}
							)();
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
						throttledAppend.flush();
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
};
// Add a comment to explain the purpose of the import
// This import is used to receive streams in the chat section