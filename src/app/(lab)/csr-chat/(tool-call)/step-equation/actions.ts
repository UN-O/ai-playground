'use server';

import { streamText, tool, CoreMessage, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import * as mathjs from 'mathjs';
import { z } from 'zod';

// Argument for the conversation
const OLD_ARG= {
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
}

const ARG_V1= {
    model: openai('gpt-4o'),
    system:
        `你是解題寶貝，專門產生系統性引導式解答

        對於物理相關的推導問題
        Step 1 首先在解之前盤點出該題目有哪些物理量，給出定義與符號代表
        Step 2 提供物理極限的估計方法，可以計算甚麼性質、有什麼特性、湊因次能解出什麼 (dimensional analysis 因次分析 using conversion of units from one dimensional unit to another, which can be used to evaluate scientific formulae.)
        Step 3 列出解決問題需要的工具與概念 Highlight necessary formulas and concepts without delving into the specifics.` +
        'Step 4 使用使用步驟回答工具(step_answer，輸入physic_problem_statement、目標要取得的答案需求、前 3 個 step 的摘要)提供完整的回答，結束回答' +
        'Must Respond succinctly. Help the students understand how to think through the problem, rather than simply providing the answer.Respond succinctly.',
    tools: {
        step_answer: tool({
            description: 'A tool for generate structure answer of physics problem IN 繁體中文 #zh-TW.',
            parameters: z.object({ 
                physic_problem_statement: z.string().describe("summarize the problem statement in detial, including all the necessary information"),
                answer_requerment: z.string().describe("list the answer requirement ex. the equation of motion and explicit function solution y(t)=?"),
                brief_analysis: z.string().describe("brief analysis of the problem statement from previous steps"),
            }),

            execute: async ({ physic_problem_statement, answer_requerment , brief_analysis }) => {
                const result = await generateObject({
                    model: openai("gpt-4-turbo"),
                    schema: z.object({
                        steps: z.array(
                            z.object({
                                concept: z.string().describe("brief calculation statement"),
                                latex_formulas: z.string().describe("the latex formula of the calculation step"),
                                textual_description: z.string().describe("detail explain of the calculation"),
                            }),
                        ).describe("Please make sure to organize the key concepts for solving the problem."),
                        notification: z.string().describe("justify important details to be aware of"),
                    }),
                    messages: [
                        { role: "system", content: "YOU ARE a professional explanation generator for physics students slove the whole problem in detail. Highlight necessary formulas. Please make sure to organize the key concepts for solving the problem and the important details to be aware of. Focus on providing a textual description and detail calculation. Execute the math, solve whole problem in detail step by step. Use symbolic representation over actual numbers where appropriate. Finish all calculation in 繁體中文 #zh-TW." },
                        { role: "user", content: `please give me ${answer_requerment} for ${physic_problem_statement} I know that ${brief_analysis}` }
                    ],
                }); 
                return result.object;
            },
        }),
    },
    onStepFinish({ stepType, toolCalls }) {
        console.log('Step finished:', stepType, toolCalls);
    },
    maxSteps: 10,
}

const ARG_V2= {
    model: openai('gpt-4-turbo'),
    system:
        `你是解題寶貝，你會連續使用工具來產生結構化解答
        你的回答內請勿使用 latex 公式，每當遇到數學公式只能使用 latex_equation 工具來產生數學公式區塊，包含最終的解答也要使用這個工具。
        Must Respond succinctly. Help the students understand how to think through the problem, rather than simply providing the answer.Respond succinctly.`,
    tools: {
        latex_equation: tool({
            description: 'A tool for generate latex equation and its explanation.',
            parameters: z.object({ 
                equation: z.string().describe("the equation of the problem in latex format"),
                explanation: z.string().describe("the explanation of the equation"),
            }),
            execute: async () => {
                return "done";
            },
        }),
    },
    onStepFinish({ stepType, toolCalls }) {
        console.log('Step finished:', stepType, toolCalls);
    },
    maxSteps: 10,
}

const ARG_V3= {
    model: openai('gpt-4o'),
    system:
        `你是解題寶貝，專門使用適合的工具回應學生
        在解題開始前請自我介紹打招呼
        如果使用者問了一個新問題請使用 step_answer 工具取得 result，請勿重述 result 內容，請單獨解釋 result 的最終答案，請勿詳細解釋步驟

        如果使用者追問問題，請勿使用 step_answer 工具，直接回答問題即可
        `,
    tools: {
        step_answer: tool({
            description: 'A tool for generate structure answer of physics problem IN 繁體中文 #zh-TW.',
            parameters: z.object({ 
                physic_problem_statement: z.string().describe("summarize the problem statement in detial, including all the necessary information"),
                answer_requerment: z.string().describe("list the answer requirement ex. the equation of motion and explicit function solution y(t)=?"),
                brief_analysis: z.string().describe("brief analysis of the problem statement from previous steps"),
            }),

            execute: async ({ physic_problem_statement, answer_requerment , brief_analysis }) => {
                const result = await generateObject({
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
                return result.object;
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
        const result = streamText({...ARG_V3, messages: history,});

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