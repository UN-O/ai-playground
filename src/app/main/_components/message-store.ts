import { create } from 'zustand';
import { CoreMessage } from 'ai';
import { nanoid } from 'nanoid';



// TODO: parent message 來去做到版本分支
interface MessageState {
    messages: Record<string, CoreMessage>; // 以 id 為 key 儲存訊息
    messageOrder: string[]; // 儲存訊息的順序
    input: string; // 用戶輸入
    appendMessage: (message: CoreMessage) => void;
    clearMessages: () => void;
    setInput: (value: string) => void;
    getMessagesAsArray: () => CoreMessage[];
    submitInput: () => Promise<CoreMessage | null>; // 新增的提交方法
}

export const useMessageStore = create<MessageState>((set, get) => ({
    messages: {} as Record<string, CoreMessage>,
    messageOrder: [],
    input: "",
    clearMessages: () =>
        set(() => ({
            messages: {} as Record<string, CoreMessage>,
            messageOrder: [],
        })),
    appendMessage: (message) => {
        const id = nanoid(); // 生成唯一 id
        set((state) => {
            const { messages, messageOrder } = state;

            // 如果是 assistant 訊息且最後一條訊息也是 assistant，則替換最後一條訊息
            if (message.role === 'assistant') {
                const lastMessageId = messageOrder[messageOrder.length - 1];
                const lastMessage = messages[lastMessageId];

                if (lastMessage && lastMessage.role === 'assistant') {
                    return {
                        messages: {
                            ...messages,
                            [lastMessageId]: message, // 替換最後一條訊息
                        },
                    };
                }
            }

            // 否則，新增新訊息
            return {
                messages: {
                    ...messages,
                    [id]: message,
                },
                messageOrder: [...messageOrder, id],
            };
        });
    },
    setInput: (value) => set(() => ({ input: value })),
    getMessagesAsArray: () => {
        const state = get();
        return state.messageOrder.map((id) => state.messages[id]); // 按順序返回 messages
    },
    submitInput: async () => {
        const state = get();
        const input = state.input;
        if (!input) return null;

        const inputMessage: CoreMessage = {
            role: 'user',
            content: [{ type: 'text', text: input }],
        };

        set(() => ({ input: "" }));
        state.appendMessage(inputMessage);
        return inputMessage;
    },
}));
