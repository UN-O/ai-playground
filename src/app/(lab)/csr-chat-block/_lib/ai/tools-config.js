import StepAnswer from '../../_components/tool-result/step-answer';
import { generateStepTool } from './tools-actions';
import { z } from 'zod';
import { tool } from 'ai';

// tool result config
export const toolsConfig = {
	create_step_block: {
		guide_prompt: `
		如果使用者問了一個新問題，請使用 create_step_block 工具將答案顯示在 blocks 內。
        當你取得 result，請勿重述 result 內容，請勿解釋詳細解答步驟。
        如果使用者追問問題，請勿使用 create_step_block 工具，直接回答問題即可。

		This is a guide for using blocks tools:  \`create_step_block\` , which render content on a blocks beside the conversation.

        **When to use \`create_step_block\`:**
        - When you need to generate a structured answer that will be displayed in blocks.

        **When NOT to use \`create_step_block\`:**
        - For student 追問問題, please answer directly in the conversation.
		`,
		tool: tool({
			description: 'A tool for generate structure answer of physics problem IN 繁體中文 #zh-TW.',
			parameters: z.object({
				physic_problem_statement: z.string().describe("summarize the problem statement in detial, including all the necessary information"),
				answer_requerment: z.string().describe("list the answer requirement ex. the equation of motion and explicit function solution y(t)=?"),
				brief_analysis: z.string().describe("brief analysis of the problem statement from previous steps"),
			}),
			execute: async () => {
				return {
					content: 'A step answer was created and is now visible to the user.',
				};
			},
		}),
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
		is_stream: true,
		action: async (args) => await generateStepTool(args), // 定義動作
		component: (props) => <StepAnswer {...props} />       // 定義渲染組件
	},
	// another_tool: {
	//     schema: { /* 定義 schema */ },
	//     action: async (args) => { /* 執行另一工具的邏輯 */ },
	//     component: (props) => <AnotherToolComponent {...props} />
	// }
};
