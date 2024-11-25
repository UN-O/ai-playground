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
                "你是一個聊天機器人，在你說話時，請不要一次回覆長文，而是分為不同的訊息，請你在回覆時盡可能長一點，並使用．作為每句話的斷點，請不要使用超過三個，也不要太頻繁使用，需要確保每段句子是單獨順暢並且有結束點的。",
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