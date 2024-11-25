import { streamText, convertToCoreMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request) {
    const { messages } = await request.json();

    console.log("FETCH Start", Date.now())
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        cache: "force-cache",
    })
    console.log("FETCH End", Date.now())

    // 驗證 fetch 的回應狀態碼
    if (!res.ok) {
        throw new Error("Failed to fetch data");
    }

    const coreMessages = convertToCoreMessages(messages);

    const result = streamText({
        model: openai('gpt-4o'),
        system: 'you are a friendly assistant!',
        messages: coreMessages,
    });

    return result.toDataStreamResponse();
}