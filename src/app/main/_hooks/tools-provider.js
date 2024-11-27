import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { readStreamableValue } from 'ai/rsc';
import { toolsConfig } from '../_components/tools-config';



const ToolsContext = createContext();

export const ToolsProvider = ({ children }) => {
    const [activeToolId, setActiveToolId] = useState(null); // 當前啟用工具的 id
    const [toolResults, setToolResults] = useState([]); // 工具執行結果的陣列
    const [openBlock, setOpenBlock] = useState(false);

    const activeResult = toolResults.find((result) => result.id === activeToolId) || null;

    const clearTools = useCallback(() => {
        setActiveToolId(null);
        setToolResults([]);
        setOpenBlock(false);
    }, []);
    
    useEffect(() => {
        if (activeToolId) {
            setOpenBlock(true);
        }
    }, [activeToolId]);

    // 執行工具 action streaming 
    // TODO: type: create tool(add new tab), update tool(modify current tab)
    const executeTool = useCallback(async (toolName, args, toolId) => {
        const tool = toolsConfig[toolName];
        if (!tool) {
            console.error(`Tool ${toolName} not found`);
            return;
        }

        try {
            const result = await tool.action(args);

            const newToolResult = {
                id: toolId,
                toolName,
                result: null,
            };

            setToolResults((prev) => [...prev, newToolResult]);
            setActiveToolId(toolId);

            for await (const delta of readStreamableValue(result.streamValue)) {
                setToolResults((prev) =>
                    prev.map((item) =>
                        item.id === toolId
                            ? { ...item, result: delta }
                            : item
                    )
                );
            }
        } catch (error) {
            console.error(`Error in tool ${toolName}:`, error);
        }
    }, []);

    const setActiveTabById = useCallback((id) => {
        setActiveToolId(id);
    }, []);



    return (
        <ToolsContext.Provider
            value={{
                openBlock,
                setOpenBlock,
                activeToolId,
                toolResults,
                activeResult,
                setActiveTabById,
                executeTool,
                clearTools,
            }}
        >
            {children}
        </ToolsContext.Provider>
    );
};

// 自定義 Hook 方便使用
export const useTools = () => {
    const context = useContext(ToolsContext);
    // if (!context) {
    //     throw new Error('useTools must be used within a ToolsProvider');
    // }
    return context;
};
