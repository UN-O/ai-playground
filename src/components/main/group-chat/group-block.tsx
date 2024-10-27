"use client";

import { useState, useEffect, useRef } from "react";
import { ClientMessage } from "@/components/main/draw-plot/action";
import { useActions, useUIState, useAIState } from "ai/rsc";
import { nanoid } from "nanoid";
import React from "react";

export const GroupBlock = () =>{
    const [input, setInput] = useState<string>("");
    const [conversation, setConversation] = useUIState(); // AI provider 的 hook
    const [messages, setMessages] = useAIState(); // AI provider 的 hook
    const { continueConversation } = useActions(); // AI provider 的 hook 會回傳所有的 Server Action()， key client side 可以
    const msgRef = useRef(null);

    useEffect(() => {
        console.log("AI STATE MESSAGES", messages);
        console.log("CONVERSATION", conversation);
    }, [messages]);

    const divideMessage = (message: ClientMessage) => {
        setConversation((currentConversation: ClientMessage[]) => {
            const splitMessages: ClientMessage[] = [];

            // 遍歷 ReactNode 的子元素，並處理包含 `[br]` 的文字
            React.Children.forEach(message.display, (msg: React.ReactNode) => {
                // 檢查 msg 是否是有效的 React 元素
                if (React.isValidElement(msg))
                {
                    // 提取其所有子元素的文本
                    const extractText = (node: React.ReactNode): string => {
                        if (typeof node === 'string')
                        {
                            return node;
                        }
                        if (React.isValidElement(node))
                        {
                            return React.Children.toArray(node.props.children)
                                .map(extractText)
                                .join(''); // 將所有文本合併
                        }
                        return '';
                    };
                    const fullText = extractText(msg); // 獲取完整文本
                    if (fullText.includes("[br]"))
                    {
                        const textSegments = fullText.split("[br]").map(text => text.trim());
                        textSegments.forEach((text) => {
                            splitMessages.push({
                                id: nanoid(),
                                role: message.role,
                                display: <div>{text}</div>,
                            });
                        });
                    }
                    else
                    {
                        // 不包含 [br] 的元素直接加入
                        splitMessages.push({
                            id: nanoid(),
                            role: message.role,
                            display: msg,
                        });
                    }
                }
            });

            const addMessagesWithDelay = async (msgs: ClientMessage[]) => {
                for (const msg of msgs) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒延遲
                    setConversation((prev: any[]) => {
                        if (!prev.some(existingMsg => existingMsg.id === msg.id)) {
                            console.log();
                            return [...prev, msg];
                        }
                        return prev;
                    });
                }
            };

            addMessagesWithDelay(splitMessages);

            return currentConversation;
        });
    };

    const handleMessage = (message: ClientMessage) => {
        setConversation((currentConversation: ClientMessage[]) => {
            const splitMessages: ClientMessage[] = [];

            // 遍歷 ReactNode 的子元素，並處理包含 `[br]` 的文字
            React.Children.forEach(message.display, (msg: React.ReactNode) => {
                // 檢查 msg 是否是有效的 React 元素
                if (React.isValidElement(msg))
                {
                    // 提取其所有子元素的文本
                    const extractText = (node: React.ReactNode): string => {
                        if (typeof node === 'string')
                        {
                            return node;
                        }
                        if (React.isValidElement(node))
                        {
                            return React.Children.toArray(node.props.children)
                                .map(extractText)
                                .join(''); // 將所有文本合併
                        }
                        return '';
                    };

                    const fullText = extractText(msg); // 獲取完整文本

                    if (fullText.includes("[br]"))
                    {
                        const textSegments = fullText.split("[br]").map(text => text.trim());
                        textSegments.forEach((text) => {
                            splitMessages.push({
                                id: nanoid(),
                                role: message.role,
                                display: <div>{text}</div>,
                            });
                        });
                    }
                    else
                    {
                        // 不包含 [br] 的元素直接加入
                        splitMessages.push({
                            id: nanoid(),
                            role: message.role,
                            display: msg,
                        });
                    }
                }
            });

            // 更新 conversation，加入分割後的訊息
            return [...currentConversation, ...splitMessages];
        });
    };
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

                    try
                    {
                        const message = await continueConversation(input, msgRef); // 單純取得 ReactNode 的內容
                        handleMessage(message);
                    }
                    catch (error)
                    {
                        console.error(error);
                    }
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
