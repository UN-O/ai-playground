import StepAnswer from './tool-result/step-answer';
import { generateStepTool } from '../exam-block/actions';
import { z } from 'zod';



export const toolsConfig = {
    create_step_block: {
        schema: z.object({
            steps: z.array(
                z.object({
                    concept: z.string().default("Default concept").describe("brief calculation statement"),
                    latex_formulas: z.string().default("").describe("the latex formula of the calculation step"),
                    textual_description: z
                        .string()
                        .default("Explain the calculation here using $inline math$")
                        .describe("detail explain of the calculation use $ /latex $ for inline math"),
                })
            ).default([]).describe("Please make sure to organize the key concepts for solving the problem."),
            notification: z
                .string()
                .default("Be careful about the units.")
                .describe("justify important details to be aware of"),
        }),
        type: "block", // 工具類型：block
        block: "create",
        action: async (args) => await generateStepTool(args), // 定義動作
        component: (props) => <StepAnswer {...props} />       // 定義渲染組件
    },
    // another_tool: {
    //     schema: { /* 定義 schema */ },
    //     action: async (args) => { /* 執行另一工具的邏輯 */ },
    //     component: (props) => <AnotherToolComponent {...props} />
    // }
};
