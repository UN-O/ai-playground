// Import UI components
import ChatSection from "./chat-section";

export const metadata = {
    title: "AI SDK RSC",
    description: "use `createStreamableValue` from ai-sdk-rsc by UNO",
};

export default function Page() {
    return (
        <div className="h-svh w-full">
            <ChatSection />
        </div>
    );
}