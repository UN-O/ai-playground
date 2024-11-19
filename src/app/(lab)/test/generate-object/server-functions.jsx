"use server";
// ! every use server function should lock with "role" for safty

// Import AI SDK
import { generateText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai"; // Ensure OPENAI_API_KEY environment variable is set
import { z } from 'zod';


export async function GenerateTextServer(messages) {
    "use server";
    // * Generate text should be in server side so that it can read the API key

    const response = await generateText({
        model: openai("gpt-4o"),
        system: SYSTEM_PROMPT1,
        prompt: "Why is the sky blue?",
        temperature: 1,
    })

    // OUTPUT: 
    // response.text : string
    // response.finishReason : stop 
    // response.usage { completionTokens: 153, promptTokens: 23, totalTokens: 176 } 

    return response.text;
}

export async function GenerateObjectServer() {
    "use server";

    const {interviewee,  task_context, task_requirements, task_execution, preferences} = { "interviewee": { "name": "職業賽車手", "role": "賽車手", "primary_goal": "運動" }, "task_context": { "typical_tasks": [{ "name": "運動", "description": "進行體能訓練以保持身體狀態。" }, { "name": "跳舞", "description": "作為放鬆和提高協調性的活動。" }, { "name": "賽車訓練", "description": "在賽道上進行駕駛訓練以提高技術。" }, { "name": "賽車維護", "description": "檢查和維護賽車的性能。" }, { "name": "策略會議", "description": "與團隊討論比賽策略和改進方案。" }], "task_prioritization": "importance-based", "task_tracking_methods": ["數位應用程式", "日曆", "筆記本", "團隊協作工具"] }, "task_requirements": { "required_fields": [{ "field_name": "任務名稱", "purpose": "清楚描述任務的名稱。" }, { "field_name": "截止日期", "purpose": "明確任務需要完成的時間。" }, { "field_name": "優先級", "purpose": "標註任務的重要性或緊急程度。" }, { "field_name": "描述", "purpose": "提供任務的詳細信息或步驟。" }, { "field_name": "狀態", "purpose": "標記任務的進度。" }], "optional_fields": [{ "field_name": "所需資源", "purpose": "列出完成任務所需的工具或資源。" }, { "field_name": "相關人員", "purpose": "標註需要協作的團隊成員或聯絡人。" }, { "field_name": "預計時間", "purpose": "估計完成任務所需的時間。" }, { "field_name": "備註", "purpose": "添加任何額外的注釋或提醒。" }, { "field_name": "地點", "purpose": "如果任務需要在特定地點完成，則標註地點。" }] }, "task_execution": { "subtasks": true, "subtask_types": ["專注子任務", "準備子任務", "回顧子任務", "休息子任務"], "conditions_for_completion": true, "typical_conditions": [{ "condition": "達成目標", "example": "完成預定的訓練圈數或達到特定的速度。" }, { "condition": "時間限制", "example": "在預定的時間內完成任務。" }, { "condition": "質量標準", "example": "達到特定的技術或表現標準。" }, { "condition": "團隊確認", "example": "獲得教練或團隊成員的確認和反饋。" }] }, "preferences": { "notification_preferences": "通知", "schema_format": "flexible" } }

    console.log("|||||||||||||||||||||||START|||||||||||||||||||||||||||");

    const result = await generateObject({
        model: openai("gpt-4o"),
        schema: z.object({
            tasks: z.array(
                z.object({
                    title: z.string().describe("The title of the task"),
                    description: z.string().describe("Detailed explanation of the task"),
                    priority: z.enum(["low", "medium", "high"]).describe("The priority level of the task"),
                    start_time: z.string().optional().describe("The starting time of the task in ISO 8601 format (optional)"),
                    duration: z.number().describe("The duration of the task in minutes"),
                    conditions: z.array(
                        z.object({
                            condition: z.string().describe("A specific condition required to complete the task"),
                            status: z.enum(["not met", "in progress", "met"])
                                .describe("The current status of the condition"),
                        })
                    ).optional().describe("A list of conditions that need to be fulfilled to complete the task."),
                    subtasks: z.array(
                        z.object({
                            name: z.string().describe("The name of the subtask"),
                            subtask_type: z.enum(["begin_period", "focus_period", "short break_period", "long break_period", "summary_period"])
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
            {
                role: "system",
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
            }
        ],
    });
    console.log("|||||||||||||||||||||||DONE|||||||||||||||||||||||||||");
    return result.object;
}

export async function responseMessage(messages) {
    // * Generate text should be in server side so that it can read the API key

    const formattedArray = messages.length === 1
        ? ([])
        : (messages.map((text, index, array) => {
            // Reverse the index to start with the user
            const reverseIndex = array.length - 1 - index;
            const role = reverseIndex % 2 === 0 ? "user" : "assistant";
            return { role, content: text };
        }))

    const response = await generateText({
        model: openai("gpt-4o-mini"),
        system: SYSTEM_PROMPT1,
        messages: formattedArray,
    })

    return response.text;
}