"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import { generateObject, generateText } from "ai";
import { equationSchema } from "@/components/main/draw-plot/equation";
import { EquaComponent } from "@/components/main/draw-plot/equa-component";

export interface ServerMessage {
    role: "user" | "assistant";
    content: any;
}

export interface ClientMessage {
    id: string;
    role: "user" | "assistant";
    display: ReactNode;
}

export async function continueConversation(
    input: string,
): Promise<ClientMessage> {
    "use server";

    const history = getMutableAIState(); // histroy 是個 class (mutable AI State), 有兩個 method: update, done. 來去跟 AI State 互動 (用來輸入給 AI 的內容)
    // ! When error occurs, the streamUI will not be closed
    const result = await streamUI({
        model: openai("gpt-4o"),
        messages: [
            { role: "system", content: "你扮演一個會答應所有使用者要求的機器人，你有繪圖工具solveEquation 和笑話工具tellJoke 可以使用" },
            ...history.get(),
            { role: "user", content: input } //content: string | Array<TextPart | ImagePart | FilePart>
        ],
        text: ({ content, done }) => { // content: string | Array<TextPart | ToolCallPart>
            if (done) {
                // * 在完整回傳成功之後才更新 AI state
                history.done((messages: ServerMessage[]) => [
                    ...messages,
                    { role: "user", content: input }, // 將使用者輸入的訊息存入 history
                    { role: "assistant", content },
                ]);
            }

            return <div>{content}</div>; // 回傳 component，且 content 是個 state 會 streaming 更新
        },
        tools: {
            solveEquation: {
                description: "get the equation.",
                parameters: z.object({
                    equation: z.string().describe("the users equation in change to y(x)"), // 會跟使用者要這樣的資訊
                }),
                generate: async function* () {
                    yield <div>loading...</div>;

                    const result = await generateObject({
                        model: openai("gpt-3.5-turbo"),
                        schema: equationSchema,
                        messages: [
                            { role: "system", content: "YOU ARE a professional explanation generator for physics students. in the answer then elucidate the significance and application of plots in a step-by-step manner. Understand it and explain it detailed in traditional chinese anyway.`" },
                            ...history.get(),
                            { role: "user", content: input }
                        ],
                    }); // ! 這不是 Streaming 的，要切換成 streamObject 才行

                    // 在這裡將使用 tools 的訊息存入 history，更新 AI state
                    const contentArray = [
                        { type: "text", text: result.object.intro }, 
                        { type: "tool-call", toolCallId: "123", toolName: "solveEquation", args: result.object },
                    ];
                    history.done((messages: ServerMessage[]) => [
                        ...messages,
                        { role: "user", content: input }, // 將使用者輸入的訊息存入 history
                        { role: "assistant", content: contentArray },
                        { role: "tool", content: [ {type:'tool-result', toolCallId: "123", toolName: "solveEquation", result: {}} ]}
                    ]); // ! 變成 Streaming 後就用 streamObject({onFinish({contentArray}){save}})

                    return <EquaComponent eqution={result.object} input={result.object.plot} />;
                },
            },
            tellJoke: {
                description: "tell a joke.",
                parameters: z.object({
                    location: z.string().describe("the users location"),
                }),
                generate: async function* () {
                    yield <div>loading...</div>;

                    const result = await generateText({
                        model: openai("gpt-3.5-turbo"),
                        prompt: `Tell a math joke in traditional chinese`,
                    });

                    // 在這裡將使用 tools 的訊息存入 history，更新 AI state
                    history.done((messages: ServerMessage[]) => [
                        ...messages,
                        { role: "user", content: input }, // 將使用者輸入的訊息存入 history
                        { role: "assistant", content: result.text },
                    ]);

                    return result.text;
                },
            },
        },
    });

    return {
        id: nanoid(),
        role: "assistant",
        display: result.value, // 回傳 ReactNode (有點像指標)，而不是個單純 content
    };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
    actions: {
        continueConversation,
    },
    initialAIState: [],
    initialUIState: [],
});
