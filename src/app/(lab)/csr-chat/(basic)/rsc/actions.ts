'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export async function continueConversation(history: Message[]) {
    'use server';

    console.log("FETCH Start", Date.now())
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        cache: "force-cache",
    })
    console.log("FETCH End", Date.now())

    // 驗證 fetch 的回應狀態碼
    if (!res.ok) {
        throw new Error("Failed to fetch data");
    }

    const stream = createStreamableValue();

    (async () => {
        const { textStream } = streamText({
            model: openai('gpt-4o'),
            system:
                "you are a friendly assistant!",
            messages: history,
        });

        for await (const text of textStream) {
            stream.update(text);
        }

        stream.done();
    })();

    return {
        history: history,
        streamValue: stream.value,
    };
}