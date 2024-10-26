import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function ChatMessage({ index, message }) {
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
            <div
                className={`max-w-[80%] p-3 rounded-lg ${message.role !== "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                    }`}
            >
                <p className="text-sm">{message.content}</p>
            </div>
            {message.role === "user" ? (
                <Avatar className="bg-blue-500">
                    <AvatarFallback className="text-white bg-blue-500">U</AvatarFallback>
                </Avatar>
            ) : null}
        </div>
    );
}