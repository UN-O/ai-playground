'use server';

import { streamText, tool, CoreMessage, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import * as mathjs from 'mathjs';
import { z } from 'zod';

// TODO: 設計一個 tool comfirm 按鈕，讓使用者可以確認是否要繼續下一步
/*
    建構一個 prompt 的流程
    1. 寫出角色設定
    2. 寫出期待的步驟

    ! 不要在 schema 內寫入 enum 錯誤的形式
    3. 製作選項??
*/
const ARG= {
    model: openai('gpt-4o'),
    system:
        `你是生活智慧王，add "---" to separate every sentence. 使用者叫做「老哥」，他是名研究生
        1. 詢問使用者今天想要做什麼事情
        2. 透過引導式簡短問題，與使用者聊天取得 generate_list 工具所需的資訊後，使用 generate_list 生成一個待辦事項清單 object 的優先順序
        3. 若使用者表達「幫我想、幫我規劃」，則直接根據使用者的角色產生完整的待辦事項清單

        你必須遵守以下原則：
        1. 問題要簡單明瞭，一次只能問一個問題，字數 < 100 字
        2. 請保持幽默
        3. 請勿使用 markdown 語法
        4. You must use "---" to separate every complete sentence.
        `,
    tools: {
        generate_list: tool({
            description: 'get the users information in object format for helping them to generate a to-do list you should write parameters in pain text',
            parameters: z.object({
                interviewee: z.object({
                    name: z.string().describe("The name of the interviewee"),
                    role: z.string().describe("The role or job title of the interviewee"),
                    primary_goal: z.string().describe("The primary goal or purpose for creating the task schema"),
                }).describe("Basic information about the interviewee."),
                task_context: z.object({
                    typical_tasks: z.array(
                        z.object({
                            name: z.string().describe("The name or type of a typical task"),
                            description: z.string().describe("A brief description of the task"),
                        })
                    ).describe("Examples of typical tasks the interviewee performs."),
                    task_prioritization: z.enum(["time-based", "importance-based", "other"])
                        .describe("How the interviewee prioritizes their tasks."),
                    task_tracking_methods: z.array(z.string())
                        .describe("The methods or tools the interviewee uses to track tasks (e.g., notebooks, apps)."),
                }).describe("Details about the context in which tasks are created and managed."),
                task_requirements: z.object({
                    required_fields: z.array(
                        z.object({
                            field_name: z.string().describe("The name of a required field for the task schema"),
                            purpose: z.string().describe("The purpose or reason for including this field"),
                        })
                    ).describe("Fields that the interviewee believes are essential for defining tasks."),
                    optional_fields: z.array(
                        z.object({
                            field_name: z.string().describe("The name of an optional field for the task schema"),
                            purpose: z.string().describe("The purpose or reason for including this field"),
                        })
                    ).optional().describe("Fields that are useful but not essential for defining tasks."),
                }).describe("Details about the fields the task schema must include."),
                task_execution: z.object({
                    subtasks: z.boolean().describe("Does the interviewee break tasks into subtasks?"),
                    // subtask_types: z.array(z.string())
                    //     .optional()
                    //     .describe("If applicable, the types of subtasks the interviewee defines (e.g., focus, break, summary)."),
                    conditions_for_completion: z.boolean()
                        .describe("Does the interviewee use specific conditions to determine when a task is complete?"),
                    typical_conditions: z.array(
                        z.object({
                            condition: z.string().describe("A typical condition used to determine task completion"),
                            example: z.string().describe("An example of this condition in practice"),
                        })
                    ).optional().describe("Examples of conditions the interviewee uses for task completion."),
                }).describe("How the interviewee defines and tracks task execution."),
                preferences: z.object({
                    notification_preferences: z.string()
                        .optional()
                        .describe("How the interviewee prefers to be reminded about tasks (e.g., notifications, email)."),
                    schema_format: z.enum(["simple", "detailed", "flexible"])
                        .describe("The preferred format for the task schema."),
                }).describe("The interviewee's personal preferences regarding task schema and notifications."),
            }),
            execute: async ({interviewee,  task_context, task_requirements, task_execution, preferences}) => {
                const result = await generateObject({
                    model: openai("gpt-4o"),
                    schema: z.object({
                        tasks: z.array(
                            z.object({
                                id: z.number().describe("The unique identifier of the task"),
                                title: z.string().describe("The title of the task"),
                                description: z.string().describe("Detailed explanation of the task"),
                                priority: z.enum(["low", "medium", "high"]).describe("The priority level of the task"),
                                start_time: z.string().optional().describe("The starting time of the task in ISO 8601 format (optional)"),
                                duration: z.number().describe("The duration of the task in minutes"),
                                conditions: z.array(
                                    z.object({
                                        id: z.number().describe("The unique identifier of the condition"),
                                        condition: z.string().describe("A specific condition required to complete the task"),
                                        status: z.enum(["not met", "in progress", "met"])
                                            .describe("The current status of the condition"),
                                    })
                                ).optional().describe("A list of conditions that need to be fulfilled to complete the task."),
                                subtasks: z.array(
                                    z.object({
                                        id: z.number().describe("The unique identifier of the subtask"),
                                        name: z.string().describe("The name of the subtask"),
                                        type: z.enum(["start", "focus", "short break", "long break", "summary"])
                                            .describe("The type of the subtask, indicating its purpose"),
                                        status: z.enum(["not started", "in progress", "completed"])
                                            .describe("The status of the subtask"),
                                    })
                                ).optional().describe("A list of subtasks associated with the main task (optional)"),
                            })
                        )
                        .describe("A list of tasks to be completed, sorted by priority level."),
                        notification: z.string().describe("Important details or reminders related to the todo list."),
                    }),
                    messages: [
                        {   role: "system", 
                            content: `
                            YOU ARE a professional task arange agent generator 
    
                            The default principles are:

                            1. **Start with Focus**: Begin with tasks that are easy to complete, such as tidying up your workspace or responding to simple emails, to cultivate a "task completion" mindset. At the same time, set a clear main goal for the day to establish a clear direction for core tasks. Create a focused work environment by turning off unnecessary notifications.

                            2. **Task Prioritization**: Arrange tasks in order of complexity and logical progression. Start with high-focus, core tasks and then move to shorter, related follow-up tasks to maintain workflow continuity. Avoid inserting unrelated trivial tasks that might disrupt concentration and require additional mental adjustments.

                            3. **Plan Rest Periods**: Schedule short breaks of 5–10 minutes after each work segment for activities such as stretching or drinking water. Ensure the break activities do not stray too far from the current focus (e.g., avoid browsing social media). After completing a 90-minute deep focus cycle, take a longer 15-minute break for light activities like walking to refresh your energy.

                            4. **End Each Work Segment**: After completing an important task, take 2–3 minutes to review your progress and document insights. Tidy up your workspace and outline the details for the next task to ensure a smooth transition into the next focus segment.

                            5. **Daily Summary**: At the end of the day, spend 10 minutes reviewing your progress, noting completed tasks and areas for improvement. Set clear goals for the next day to build anticipation and make it easier to enter focus mode.
                            
                            Finish all calculation in 繁體中文 #zh-TW.
                            ` },
                        {   
                            role: "user", 
                            content: `
                            使用者的名稱叫 ${interviewee.name}，他是個 ${interviewee.role}。他希望建立一個任務 schema，主要目的是：${interviewee.primary_goal}。

                            在日常任務的管理上，他的典型任務包括：
                            ${task_context.typical_tasks.map(
                                (task) => `- ${task.name}：${task.description}`
                            ).join("\n")}

                            他目前的任務排序方式是基於 ${task_context.task_prioritization === "time-based" ? "時間優先" : task_context.task_prioritization === "importance-based" ? "重要性優先" : "其他方式"}，並使用 ${task_context.task_tracking_methods.join("、")} 來追蹤任務。

                            在建立任務 schema 時，他認為必要的欄位有：
                            ${task_requirements.required_fields.map(
                                (field) => `- ${field.field_name}：${field.purpose}`
                            ).join("\n")}

                            可選的欄位則包括：
                            ${task_requirements.optional_fields?.map(
                                (field) => `- ${field.field_name}：${field.purpose}`
                            ).join("\n") || "無"}

                            在執行任務時，他 ${task_execution.subtasks ? "會" : "不會"} 使用子任務。


                            此外，他 ${task_execution.conditions_for_completion ? "會" : "不會"} 使用條件來決定任務完成。常見的條件包括：
                            ${task_execution.typical_conditions?.map(
                                (condition) => `- ${condition.condition}：例如 ${condition.example}`
                            ).join("\n") || "無"}

                            在通知偏好方面，他希望以 ${preferences.notification_preferences || "未指定"} 的方式提醒任務進度。而在 schema 格式上，他偏好使用 ${preferences.schema_format === "simple" ? "簡單格式" : preferences.schema_format === "detailed" ? "詳細格式" : "靈活格式"}。

                            綜合以上需求，可以設計出適合的任務 schema，幫助 ${interviewee.name} 更高效地管理他的任務。`
                        } // ! 要把這種的給移除：子任務類型包括：${task_execution.subtask_types?.join("、") || "未指定"}
                    ],
                }); 
                return result.object;
            },
        }),
    },
    onStepFinish({ stepType, toolCalls }) {
        console.log('Step finished:', stepType, toolCalls);
    },
    maxSteps: 10,
}

// Continue the conversation with the user's input
export async function continueConversation(history: CoreMessage[]) {
    'use server';

    const stream = createStreamableValue();

    (async () => {
        const result = streamText({...ARG, messages: history,});

        for await (const part of result.fullStream) {
            stream.update(part);
        }
        stream.done();
    })();

    return {
        history: history,
        streamValue: stream.value,
    };
}

// 產生測試資料
export async function generateTestData() {
    const result = streamText({...ARG, messages: [
        { role: "system", content: "你是生活智慧王，詢問使用者今天想要做什麼事情" },
        { role: "system", content: "透過 genrate_list 工具，生成一個待辦事項清單的優先順序" },
        { role: "user", content: "我想要做一個待辦事項清單" },
    ]});

    return result;
}
