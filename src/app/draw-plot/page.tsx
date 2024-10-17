"use client";

import { useState } from "react";
import { ClientMessage } from "@/components/main/draw-plot/action";
import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "nanoid";

export default function Home() {
    const [input, setInput] = useState<string>("");
    const [conversation, setConversation] = useUIState();
    const { continueConversation } = useActions();


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

                    const message = await continueConversation(input);

                    setConversation((currentConversation: ClientMessage[]) => [
                        ...currentConversation,
                        message,
                    ]);
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
