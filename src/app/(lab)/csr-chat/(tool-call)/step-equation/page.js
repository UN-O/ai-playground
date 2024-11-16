// Import UI components
import ChatSection from "./chat-section";

export const metadata = {
    title: "Step Answer Tool Result",
    description: "Show Step Answer result in Client side from Stream with a tool calling execute generate object by UNO",
};


export default function Page() {
    return (
        <div className="h-svh w-full">
            <ChatSection />
        </div>
    );
}