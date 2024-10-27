"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import { generateObject, generateText } from "ai";
import { chatbotSchema } from "@/components/main/group-chat/chatbot";
import { ChatComponent } from "@/components/main/group-chat/chat-component";

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
    input: string, index: number
): Promise<ClientMessage> {
    "use server";

    const history = getMutableAIState();
    const result = await streamUI({
        model: openai("gpt-4o"),
        messages: [
            { role: "system", content: "你扮演一個會答應所有使用者要求的機器人，你有繪圖工具solveEquation 和笑話工具tellJoke 可以使用。在你說話時，請不要一次回覆長文，而是分為不同的訊息，請你在回覆時盡可能長一點，並使用[br]作為每句話的斷點，請不要使用超過三個，也不要太頻繁使用，需要確保每段句子是單獨順暢並且有結束點的。" },
            ...history.get(),
            { role: "user", content: input }
        ],
        text: ({ content, done }) => {
            if (done) {
                history.done((messages: ServerMessage[]) => [
                    ...messages,
                    { role: "user", content: input },
                    { role: "assistant", content },
                ]);
            }

            return <div>{content}</div>;
        },
        tools: {
            chatBot: {
                description: "user want chat with",
                parameters: z.object({
                    equation: z.string().describe(""), // 會跟使用者要這樣的資訊
                }),
                generate: async function* () {
                    yield <div>loading...</div>;

                    const result = await generateObject({
                        model: openai("gpt-4o"),
                        schema: chatbotSchema,
                        messages: [
                            { role: "system", content: "You are a chatbot, and your chat is hurried." },
                            ...history.get(),
                            { role: "user", content: input }
                        ],
                    }); // ! 這不是 Streaming 的，要切換成 streamObject 才行

                    // 在這裡將使用 tools 的訊息存入 history，更新 AI state
                    const contentArray = [
                        // { type: "text", text: result.object.first },
                        // { type: "text", text: result.object.second },
                        // { type: "text", text: result.object.third },
                        // { type: "text", text: result.object.fourth },
                        // { type: "text", text: result.object.last},
                        { type: "text", text: result.object.text},
                        { type: "tool-call", toolCallId: "123", toolName: "chatBot", args: result.object },
                    ];
                    history.done((messages: ServerMessage[]) => [
                        ...messages,
                        { role: "user", content: input }, // 將使用者輸入的訊息存入 history
                        { role: "assistant", content: contentArray },
                        { role: "tool", content: [ {type:'tool-result', toolCallId: "123", toolName: "chatBot", result: {}} ]}
                    ]); // ! 變成 Streaming 後就用 streamObject({onFinish({contentArray}){save}})

                    console.log("測試");
                    return <ChatComponent text={result.object.text} />
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

                    history.done((messages: ServerMessage[]) => [
                        ...messages,
                        { role: "user", content: input },
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
        display: result.value,
    };
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
    actions: {
        continueConversation,
    },
    initialAIState: [],
    initialUIState: [],
});
