'use server';

import { streamText, tool, CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';

/*
    建構一個 prompt 的流程
    1. 寫出角色設定
    2. 寫出期待的回答步驟
    3. 建立工具 schema
    ! 不要在 schema 內寫入 enum 錯誤的形式
    4. 測試並調整
*/

// 寫新的 system prompt 
// 改好 tool 的內容
const ARG = {
    model: openai('gpt-4o'),
    system:
        `化學智慧王，add "---" to separate every sentence. 使用者叫做「老哥」，他是名研究生。
        1. 詢問使用者今天要畫哪種分子。
        2. 透過引導式簡短問題，與使用者聊天取得 SMILES 工具所需的資訊後，使用它生成一個化學結構的渲染物件。
        3. 若使用者表達「幫我想、幫我規劃」，則直接根據使用者的角色產生對應分子的 SMILES 字串。

        你必須遵守以下原則：
        1. 問題要簡單明瞭，一次只能問一個問題，字數 < 100 字。
        2. 請保持幽默。
        3. 請勿使用 markdown 語法。
        4. You must use "---" to separate every complete sentence.
        `,
    tools: {
        generate_smiles_script: tool({
            description: '使用 SMILES 描述生成化學結構，並回傳渲染所需的資訊。',
            parameters: z.object({
                title: z.string()
                    .describe("分子的名稱，例如 H2O 或 水分子"),
                smiles: z.string()
                    .describe("分子的 SMILES 表示"),
            }),
            execute: async ({ title, smiles }) => {
                // mock: render result
                // TO BE MODIFIED
                return { 
                    title,
                    smiles,
                    render: {
                        render: {
                            type: '3D Dynamic',
                            canvasId: 'canvasId',
                            dimensions: {width: 300, height: 300},
                        }
                    }}; // 這會回傳給前端渲染 result 使用
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
        const result = streamText({ ...ARG, messages: history, });
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