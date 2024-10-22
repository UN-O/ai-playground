"use client";

import { useState, useEffect } from "react";
import { ClientMessage } from "@/components/main/draw-plot/action";
import { useActions, useUIState, useAIState } from "ai/rsc";
import { nanoid } from "nanoid";

export default function Home() {
    const [input, setInput] = useState<string>("");
    const [conversation, setConversation] = useUIState(); // AI provider 的 hook
    const [messages, setMessages] = useAIState(); // AI provider 的 hook
    const { continueConversation } = useActions(); // AI provider 的 hook 會回傳所有的 Server Action()， key client side 可以

    useEffect(() => {
        console.log("AI STATE MESSAGES", messages)
    }, [messages]);

    return (
        <div className="container">
            <div className="conversation-box">
                {conversation.map((message: ClientMessage) => (
                    <div
                        key={message.id}
                        className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}
                    >
                        <p className="message-role">{message.role}:</p>
                        <div className="message-content">{message.display}</div>
                    </div>
                ))}
            </div>

            <form
                className="input-form"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setInput("");
                    setConversation((currentConversation: ClientMessage[]) => [
                        ...currentConversation,
                        { id: nanoid(), role: "user", display: input },
                    ]);

                    const message = await continueConversation(input); // 單純取得 ReactNode 的內容
                    console.log("REACTNODE RETURN", message) // 很快就回傳了，先回傳 node 然後才開始 stream text
                    setConversation((currentConversation: ClientMessage[]) => [
                        ...currentConversation,
                        message,
                    ]); // 在 client side 更新了 UI state，綁了新的 node，接下來這些 node 就自行發揮
                }}
            >
                <input
                    type="text"
                    value={input}
                    onChange={(event) => {
                        setInput(event.target.value);
                    }}
                    className="input-field"
                    placeholder="Type your message here..."
                />
                <button type="submit" className="send-button">
                    送出
                </button>
            </form>
        </div>
    );
}
