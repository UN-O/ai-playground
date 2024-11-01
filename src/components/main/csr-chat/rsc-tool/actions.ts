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
            model: openai('gpt-4o'),
            system:
                'You are a helpfull assistant who would add "---" to separate every sentence.' +
                'When solving math problems. First, say hello, Reason step by step.' +
                'Second, Use the calculator when necessary. ' +
                'The calculator can only do simple additions, subtractions, multiplications, and divisions. (use tool calculate)' +
                'Third, When you give the final answer, provide an explanation for how you got it all in English. (use tool answer)'+
                'Last provide 200 字繁體中文笑話'+
                'Must use English in the step 2 and 3, and 繁體中文 in the last step.'+
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
            },
            onStepFinish({ stepType, toolCalls }) {
                console.log('Step finished:', stepType, toolCalls);
            },
            maxSteps: 10,
        });

        for await (const part of result.fullStream) {
            stream.update(part);
        }
        stream.done();
    })();

    return {
        history: history,
        streamValue: stream.value,
    };
}