// Import UI components
import ChatSection from "./chat-section";

export const metadata = {
    title: "AI SDK UI: useChat",
    description: "use `useChat` hook from ai-sdk-ui by UNO",
};

export default function Page() {
    return (
        <div className="h-svh w-full">
            <ChatSection />
        </div>
    );
}