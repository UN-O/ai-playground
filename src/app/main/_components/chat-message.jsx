import React from "react"

import { useMessageStore } from "./message-store";
import { ToolCall, ToolResult } from "./chat-tool"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RenderMarkdown } from "@/utils/rendering"


function RenderContent({ part, className, toolResultRender }) {
    switch (part.type) {
        case 'text': {
            const paragraphs = part.text.split('---').map((paragraph, i) => (
                paragraph === "" ? null :
                <div key={`text-${i}`} className={`text-sm whitespace-pre-wrap ${className} mb-2 w-fit text-justify max-w-md`}>
                    <RenderMarkdown>
                        {paragraph}
                    </RenderMarkdown>
                </div>
            ));

            return <>{paragraphs}</>;
        }
        case 'image':
            return (
                <img
                    src={typeof part.image === 'string' ? part.image : URL.createObjectURL(new Blob([part.image]))}
                    alt="Image content"
                    className="max-w-full h-auto mb-2"
                />
            );
        case 'file':
            return (
                <a
                    href={typeof part.data === 'string' ? part.data : URL.createObjectURL(new Blob([part.data]))}
                    download
                    className="text-blue-600 underline mb-2"
                >
                    {part.mimeType || "Download File"}
                </a>
            );
        case 'tool-call':
            return (<ToolCall toolName={part.toolName} args={part.args} />);
        case 'tool-result':
            return (<ToolResult toolName={part.toolName} result={part.result} toolCallId={part.toolCallId} isError={part.isError} toolResultRender={toolResultRender} />);
        default:
            return null;
    }
}

// rerender only when
const ChatMessage = React.memo(({ id, toolResultRender }) => {
    // 僅訂閱特定訊息，避免不必要的全局更新
    const message = useMessageStore((state) => state.messages[id]);

    const messageClassName = `p-3 rounded-lg ${message.role !== "user" ? "bg-foreground text-background" : "bg-secondary"}`;
    // 
    if (message.role === "system") {
        return null;
    }
    return (
        <div
            key={id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4 gap-2`}
        >
            {message.role !== "user" ? (
                <Avatar className="bg-primary">
                    <AvatarFallback className="text-white bg-primary">{message?.name || "AI"}</AvatarFallback>
                </Avatar>
            ) : null}
            <div className="flex flex-col">
                {Array.isArray(message.content)
                    ? message.content.map((part, partIndex) => (
                        <div
                            key={partIndex}
                            className={`
                                transition-opacity duration-500 ease-in opacity-0 transform
                                animate-fade-in`}
                        >
                            <RenderContent key={partIndex} part={part} className={messageClassName} toolResultRender={toolResultRender}/>
                        </div>
                    ))
                    : (
                        <div>
                            <RenderContent part={{ type: 'text', text: message.content }} className={messageClassName}  />
                        </div>
                    )}
            </div>
            {/* {message.role === "user" ? (
                <Avatar className="bg-blue-500">
                    <AvatarFallback className="text-white bg-blue-500">U</AvatarFallback>
                </Avatar>
            ) : null} */}
        </div>
    );
}, (prevProps, nextProps) => {
    // 僅在 id 發生改變時重新渲染
    return prevProps.id === nextProps.id;
});

export default ChatMessage;
