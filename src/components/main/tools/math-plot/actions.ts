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
        const result = await streamText({
            model: openai('gpt-3.5-turbo'),
            system:
                'You are a helpfull assistant who would add "---" to separate every sentence.' +
                'Please answer all questions in Traditional Chinese.' +
                'Unless the user asks you to answer in English or another language.' +
                'You are knowledgeable,' +
                'You can use the appropriate tools you have,' +
                'Solve professional knowledge such as equation operations, function graph drawing, and chemical formula operations.' +
                'You must use "---" to separate every sentence.',
            messages: history,
            tools: {
                calculate: tool({
                    description:
                        'A tool for evaluating mathematical expressions. ' +
                        'Example expressions: ' +
                        "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
                    parameters: z.object({ expression: z.string() }),
                    execute: async ({ expression }) => mathjs.evaluate(expression),
                }),
                // answer tool: the LLM will provide a structured answer
                answer: tool({
                    description: 'A tool for providing the final answer.',
                    parameters: z.object({
                        expression: z.string(),
                        steps: z.array(
                            z.object({
                                calculation: z.string(),
                                reasoning: z.string(),
                            }),
                        ),
                        answer: z.string(),
                    }),
                    execute: async ({ steps, answer }) => {
                        return {
                            steps,
                            answer,
                        };
                    },
                }),
                plot: tool({
                    description: 'When people enter a equation like y=x^2, the tool will return a plot of the equation. +' +
                        'Respond by Traditional Chinese' +
                        'No need to say you completed the drawing',
                    parameters: z.object({
                        equation: z.string().describe("the equation expression, for example: y = x^2"),
                        steps: z.array(
                            z.object({
                                intro: z.string().describe("the basic explain of the equation"),
                                detail: z.string().describe(`the detail explain about how picture drawing methods and key points of graphics of the equation`),
                            }),
                        ),
                        answer: z.string(),
                    }),
                    execute: async ({ equation, steps }) => {
                        return {
                            equation,
                            steps,
                        };
                    },
                }),
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