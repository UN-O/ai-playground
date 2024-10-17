import { DeepPartial } from "ai";
import { z } from "zod";

export const equationSchema = z.object({
    intro: z.string().describe("the basic explain of the equation"),
    detail: z.string().describe("the picture drawing methods and key points of graphics of the equation"),
    plot: z.string().describe("draw the plot picture about equation, use <Plot data={data} layout={{ title: '方程式圖形' }}, but need to do find equation first"),
});

export type EquationProp = DeepPartial<typeof equationSchema>;
