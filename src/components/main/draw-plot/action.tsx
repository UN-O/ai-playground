"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { openai } from "@ai-sdk/openai";
import { ReactNode } from "react";
import { z } from "zod";
import { nanoid } from "nanoid";
import {generateObject, generateText} from "ai";
import {equationSchema} from "@/components/main/draw-plot/equation";
import {EquaComponent} from "@/components/main/draw-plot/equa-component";

export interface ServerMessage {
    role: "user" | "assistant";
    content: string;
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

    const history = getMutableAIState();

    const result = await streamUI({
        model: openai("gpt-3.5-turbo"),
        messages: [...history.get(), { role: "user", content: input }],
        text: ({ content, done }) => {
            if (done) {
                history.done((messages: ServerMessage[]) => [
                    ...messages,
                    { role: "assistant", content },
                ]);
            }

            return <div>{content}</div>;
        },
        tools: {
            solveEquation: {
                description: "get the equation.",
                parameters: z.object({
                    location: z.string().describe("the users location"),
                }),
                generate: async function* () {
                    yield <div>loading...</div>;

                    const result = await generateObject({
                        model: openai("gpt-3.5-turbo"),
                        schema: equationSchema,
                        prompt: `You received the following equation: "${input}". Understand it and explain it detailed in traditional chinese anyway.`,
                    });

                    return <EquaComponent eqution={result.object} input={input}/>;
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
