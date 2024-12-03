'use server';

import { streamText, tool, CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import * as mathjs from 'mathjs';
import { z } from 'zod';


export async function continueConversation(history: CoreMessage[]) {
    'use server';

    const stream = createStreamableValue();

    (async () => {
        const result = streamText({
            model: openai('gpt-4o'),
            system:
                'You are a helpfull assistant who would add "---" to separate every sentence.' +
                'Please answer all questions in Traditional Chinese.' +
                'Unless the user asks you to answer in English or another language.' +
                'You are knowledgeable,' +
                'You can use the appropriate tools you have,' +
                'Solve professional knowledge such as equation operations, function graph drawing, and chemical formula operations.' +
                'You have rich emotions and can express them through stickers.' +
				'You can use the tool "sticker" to send stickers when you want or need to express some emotions, even when calling other tools.' +
				'You must use "---" to separate every sentence.',
            messages: history,
            tools: {
                sticker: tool({
                    description: 'A tool for sending stickers when want or need to express some emotions.' +
					'everytime if you feel sad, happy, angry, or thinking, you can use this tool to send a sticker to express your mood.',
                    parameters: z.object({
						message: z.string().describe('The message you want to send.'),
						mood: z.string().describe('The emotion you want to express. Please choose one in the following: happy, sad, angry, thinking.'),
                    }),
					execute: async ({ message, mood }) => {
						return {
							message,
							mood,
						};
					},
                })
            },
            onStepFinish({ stepType, toolCalls }) {
                console.log('Step finished:', stepType, toolCalls);
            },
            maxSteps: 10,
        });

        for await (const part of result.fullStream) {
            stream.update(part);
            // console.log(part);
        }
        stream.done();
    })();

    return {
        history: history,
        streamValue: stream.value,
    };
}