import { DeepPartial } from "ai";
import { z } from "zod";

export const chatbotSchema = z.object({
    text: z.string().describe("your response"),
    // first: z.string().describe("the first part of response"),
    // second: z.string().describe("the second part of response"),
    // third: z.string().describe("the third part of response"),
    // fourth: z.string().describe("the fourth part of response, it's not necessary"),
    // last: z.string().describe("the last part of response, it's not necessary"),
});

export type ChatbotProp = DeepPartial<typeof chatbotSchema>;
