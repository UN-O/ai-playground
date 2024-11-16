import { DeepPartial } from "ai";
import { z } from "zod";

export const equationSchema = z.object({
    intro: z.string().describe("the basic explain of the equation"),
    detail: z.string().describe("the picture drawing methods and key points of graphics of the equation"),
    plot: z.string().describe("the equation expression, for example: y = x^2"),
});

export type EquationProp = DeepPartial<typeof equationSchema>;
