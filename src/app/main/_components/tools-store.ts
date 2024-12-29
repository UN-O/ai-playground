import { create } from 'zustand';
import { toolsConfig } from './tools-config';
import { readStreamableValue } from 'ai/rsc';

interface ToolResult {
	toolName: string;
	result: any;
}

interface ToolsState {
	activeToolId: string | null; // 當前工具 ID
	toolResults: Record<string, ToolResult>; // 以 id 為 key 儲存工具執行結果
	updateResult: (id: string, result: any) => void; // 更新
	openBlock: boolean; // 工具 Block 開啟狀態
	getActiveResult: () => ToolResult | null;
	setActiveToolId: (id: string | null) => void;
	setOpenBlock: (value: boolean) => void;
	clearTools: () => void;
	executeTool: (toolName: string, args: any, toolId: string) => any; // 執行工具
}

export const useToolsStore = create<ToolsState>((set, get) => ({
	activeToolId: null,
	toolResults: {} as Record<string, ToolResult>,
	updateResult: (id, result) => {
		set((state) => {
			const { toolResults } = state;
			return {
				toolResults: {
					...toolResults,
					[id]: {
						...toolResults[id],
						result,
					},
				},
			}
		});
	},
	openBlock: false,
	getActiveResult: () =>
		get().toolResults[get().activeToolId] || null,
	setActiveToolId: (id) => set(() => ({ activeToolId: id })),
	setOpenBlock: (value) => set(() => ({ openBlock: value })),
	clearTools: () =>
		set(() => ({
			activeToolId: null,
			toolResults: {} as Record<string, ToolResult>,
			openBlock: false,
		})),
	executeTool: async (toolName, args, toolId) => {
		const tool = toolsConfig[toolName];

		if (!tool) {
			console.error(`Tool ${toolName} not found`);
			return;
		}

		try {
			const newToolResult = {
				toolName,
				result: null,
			};

			// 在這裡初始化工具結果，以便在後續更新結果
			set((state) => ({
				toolResults: {
					...state.toolResults,
					[toolId]: newToolResult,
				},
				activeToolId: toolId,
			}));
			return await tool.action(args);
		} catch (error) {
			console.error(`Error in tool ${toolName}:`, error);
		}
	},
}));
