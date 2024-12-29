'use server';

import { streamText, tool, CoreMessage, generateObject, streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';
import { simulateReadableStream, MockLanguageModelV1 } from 'ai/test';
import { LanguageModelV1StreamPart } from '@ai-sdk/provider';

// Argument for the conversation
const ARG_V3_async = {
	model: openai('gpt-4o'),
	system:
		`你是解題寶貝，專門使用適合的工具回應學生
        在解題開始前請自我介紹打招呼
        如果使用者問了一個新問題請使用 create_step_block 工具將答案顯示在 blocks 內，當你取得 result，請勿重述 result 內容，請勿解釋詳細解答步驟

        如果使用者追問問題，請勿使用 create_step_block 工具，直接回答問題即可

        Blocks is a special user interface mode that helps users with solving problem. When block is open, it is on the right side of the screen, while the conversation is on the left side. When creating create_step_block are reflected in real-time on the blocks and visible to the user.

        This is a guide for using blocks tools:  \`create_step_block\` , which render content on a blocks beside the conversation.

        **When to use \`create_step_block\`:**
        - When you need to generate a structured answer that will be displayed in blocks.

        **When NOT to use \`create_step_block\`:**
        - For student 追問問題, please answer directly in the conversation.
        `,
	tools: {
		create_step_block: tool({
			description: 'A tool for generate structure answer of physics problem IN 繁體中文 #zh-TW.',
			parameters: z.object({
				physic_problem_statement: z.string().describe("summarize the problem statement in detial, including all the necessary information"),
				answer_requerment: z.string().describe("list the answer requirement ex. the equation of motion and explicit function solution y(t)=?"),
				brief_analysis: z.string().describe("brief analysis of the problem statement from previous steps"),
			}),
			execute: async () => {
				return {
					content: 'A step answer was created and is now visible to the user.',
				};
			},
		}),

	},
	onStepFinish({ stepType, toolCalls }) {
		console.log('Step finished:', stepType, toolCalls);
	},
	maxSteps: 10,
}

// Continue the conversation with the user's input
export async function continueConversation(history: CoreMessage[]) {
	'use server';

	const stream = createStreamableValue();

	(async () => {
		const result = streamText({ ...ARG_V3_async, messages: history, });

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

export async function generateStepTool({ physic_problem_statement, answer_requerment, brief_analysis }: any) {
	'use server';

	const stream = createStreamableValue();

	(async () => {
		const { partialObjectStream } = streamObject({
			model: openai("gpt-4o"),
			schema: z.object({
				steps: z.array(
					z.object({
						concept: z.string().describe("brief calculation statement"),
						latex_formulas: z.string().describe("the latex formula of the calculation step"),
						textual_description: z.string().describe("detail explain of the calculation use $ /latex $ for inline math"),
					}),
				).describe("Please make sure to organize the key concepts for solving the problem."),
				notification: z.string().describe("justify important details to be aware of"),
			}),
			messages: [
				{ role: "system", content: "YOU ARE a professional explanation generator for physics students slove the whole problem in detail. Highlight necessary formulas. Please make sure to organize the key concepts for solving the problem and the important details to be aware of. Focus on providing a textual description and detail calculation. Execute the math, solve whole problem in detail step by step. Use symbolic representation over actual numbers where appropriate. Finish all calculation in 繁體中文 #zh-TW." },
				{ role: "user", content: `please give me ${answer_requerment} for ${physic_problem_statement} I know that ${brief_analysis}` }
			],
		});

		try {
			for await (const partialObject of partialObjectStream) {
				stream.update(partialObject);
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