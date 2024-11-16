// Import UI components
import ChatSection from "./chat-section";


export const metadata = {
    title: "Draw Plot in Client side",
    description: "Draw Plot in Client side from Stream with a tool calling by Senba",
};

export default function Page() {
    return (
        <div className="h-svh w-full">
            <ChatSection />
        </div>
    );
}