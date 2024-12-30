'use server';

import { streamText, tool, CoreMessage, generateObject, streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';
import { simulateReadableStream, MockLanguageModelV1 } from 'ai/test';
import { LanguageModelV1StreamPart } from '@ai-sdk/provider';
import { blocksPrompt } from '../_lib/ai/prompts';
import { toolsConfig } from '../_lib/ai/tools-config';

// Argument for the conversation
const toolNameList = ['create_step_block']

const ARG_V3_async = (toolNameList: Array<string>) => {

	const tools = toolNameList.reduce((acc, toolName) => {
		acc[toolName] = toolsConfig[toolName]?.tool;
		return acc;
	}, {} as Record<string, any>);

	const blockTools = toolNameList.map(toolName => toolsConfig[toolName]?.type === 'block' ? toolName : '').filter(Boolean);

	// 生成系統提示文字
	const generateSystemPrompt = () => `
        你是解題寶貝，專門使用適合的工具回應學生。
        在解題開始前請自我介紹打招呼。
        
        ${blocksPrompt(blockTools)}

        ${toolNameList.map(toolName => toolsConfig[toolName]?.guide_prompt || '').join('\n')}
    `;

    return {
        model: openai('gpt-4o'),
        system: generateSystemPrompt(),
        tools,
        onStepFinish({ stepType, toolCalls }: { stepType: string; toolCalls: any }) {
            console.log('Step finished:', stepType, toolCalls);
        },
        maxSteps: 10,
    };
}

// Continue the conversation with the user's input
export async function continueConversation(history: CoreMessage[]) {
	'use server';

	const stream = createStreamableValue();

	(async () => {
		const result = streamText({ ...ARG_V3_async(toolNameList), messages: history, });

		try {
			for await (const part of result.fullStream) {
				stream.update(part);
			}
		} catch (error) {
			console.error(error);
		}
		stream.done();

	})();

	return {
		history: history,
		streamValue: stream.value,
	};
}

function generateTextDeltaArray(input: string): LanguageModelV1StreamPart[] {
	// 分割字串成陣列，每個元素是一個字元
	const characters = input.split('');

	// 將每個字元轉換成符合格式的物件
	return characters.map(char => ({
		type: 'text-delta',
		textDelta: char
	}));
}

export async function generateGreetings() {
	'use server';

	const stream = createStreamableValue();

	(async () => {
		const chunks: LanguageModelV1StreamPart[] = [
			...generateTextDeltaArray("Hello, 親愛的，我們一起來解題吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧吧"),
			{
				type: 'tool-call',
				toolCallType: 'function',
				toolCallId: 'toolCall123',
				toolName: 'dataProcessor',
				args: JSON.stringify({
					key1: "value1",
					key2: 42,
					key3: true
				})
			},
			{
				type: 'tool-call-delta',
				toolCallType: 'function',
				toolCallId: 'toolCall123-delta',
				toolName: 'dataProcessor',
				argsTextDelta: '{"key4":"newValue"}'
			},
			{
				type: 'response-metadata',
				id: 'response-456',
				timestamp: new Date(),
				modelId: 'language-model-v1'
			},
			{
				type: 'finish',
				finishReason: 'stop',
				logprobs: undefined,
				usage: { completionTokens: 10, promptTokens: 3 },
			}
		];

		const result = streamText({
			model: new MockLanguageModelV1({
				doStream: async () => ({
					stream: simulateReadableStream({
						chunks: chunks,
						chunkDelayInMs: 10,
					}),
					rawCall: { rawPrompt: null, rawSettings: {} },
				}),
			}),
			prompt: 'Hello, test!',
			tools: {
				dataProcessor: tool({
					description: 'A tool for processing data.',
					parameters: z.object({
						key1: z.string(),
						key2: z.number(),
						key3: z.boolean(),
					}),
					execute: async ({ key1, key2, key3 }) => {
						return { key1, key2, key3 };
					},
				}),
			},
		});

		try {
			for await (const part of result.fullStream) {
				stream.update(part);
			}
		} catch (error) {
			console.error(error);
		}
		stream.done();
	})();

	return {
		streamValue: stream.value,
	};
}

export async function generateMockStream() {
	'use server';

	const stream = createStreamableValue();

	(async () => {

		const chunks: LanguageModelV1StreamPart[] = [
			{
				type: 'text-delta',
				textDelta: "This is an example of a text delta."
			},
			{
				type: 'tool-call',
				toolCallType: 'function',
				toolCallId: 'toolCall123',
				toolName: 'dataProcessor',
				args: JSON.stringify({
					key1: "value1",
					key2: 42,
					key3: true
				})
			},
			{
				type: 'tool-call-delta',
				toolCallType: 'function',
				toolCallId: 'toolCall123-delta',
				toolName: 'dataProcessor',
				argsTextDelta: '{"key4":"newValue"}'
			},
			{
				type: 'response-metadata',
				id: 'response-456',
				timestamp: new Date(),
				modelId: 'language-model-v1'
			},
			{
				type: 'finish',
				finishReason: 'stop',
				logprobs: undefined,
				usage: { completionTokens: 10, promptTokens: 3 },
			}
		];

		const result = streamText({
			model: new MockLanguageModelV1({
				doStream: async () => ({
					stream: simulateReadableStream({
						chunks: chunks,
					}),
					rawCall: { rawPrompt: null, rawSettings: {} },
				}),
			}),
			prompt: 'Hello, test!',
			tools: {
				dataProcessor: tool({
					description: 'A tool for processing data.',
					parameters: z.object({
						key1: z.string(),
						key2: z.number(),
						key3: z.boolean(),
					}),
					execute: async ({ key1, key2, key3 }) => {
						return { key1, key2, key3 };
					},
				}),
			},
		});

		try {
			for await (const part of result.fullStream) {
				stream.update(part);
			}
		} catch (error) {
			console.error(error);
		}
		stream.done();
	})();

	return {
		streamValue: stream.value,
	};
}



