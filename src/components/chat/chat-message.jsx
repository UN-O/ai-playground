import { ToolCall, ToolResult } from "@/components/chat/tool-call"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RenderMarkdown } from "@/utils/rendering"


function renderContent(part, className) {
    switch (part.type) {
        case 'text': {
            const paragraphs = part.text.split('---').map((paragraph, i) => (
                <div key={`text-${i}`} className={`text-sm whitespace-pre-wrap ${className} mb-2 w-fit text-justify`}>
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
            return (<ToolResult toolName={part.toolName} result={part.result} isError={part.isError} />);
        default:
            return null;
    }
}


export default function ChatMessage({ index, message }) {
    const messageClassName = `p-3 rounded-lg ${message.role !== "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`;
    // 
    if (message.role === "system" || message.role === "tool") {
        return null;
    }
    return (
        <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4 gap-2`}
        >
            {message.role !== "user" ? (
                <Avatar className="bg-red-500">
                    <AvatarFallback className="text-white bg-red-500">{message?.name || "AI"}</AvatarFallback>
                </Avatar>
            ) : null}
            <div className="flex flex-col sm:max-w-[60%]">
                {Array.isArray(message.content)
                    ? message.content.map((part, partIndex) => (
                        <div
                            key={partIndex}
                            className={`
                                transition-opacity duration-500 ease-in opacity-0 transform
                                animate-fade-in`}
                        >
                            {renderContent(part, messageClassName)}
                        </div>
                    ))
                    : (
                        <div>
                            {renderContent({ type: 'text', text: message.content }, messageClassName)}
                        </div>
                    )}
            </div>
            {message.role === "user" ? (
                <Avatar className="bg-blue-500">
                    <AvatarFallback className="text-white bg-blue-500">U</AvatarFallback>
                </Avatar>
            ) : null}
        </div>
    );
}


