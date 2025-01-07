import { create } from 'zustand';
import { CoreMessage } from 'ai';
import { nanoid } from 'nanoid';



// TODO: parent message 來去做到版本分支
interface ChatState {
	isLoading: boolean;
	setIsLoading: (value: boolean) => void;
	status: string;
	setStatus: (value: string) => void;
}


export const useChatStore = create<ChatState>((set, get) => ({
	isLoading: false,
	setIsLoading: (value) => set(() => ({ isLoading: value })),
	status: 'waiting_input',
	setStatus: (value) => set(() => ({ status: value })),
}));
