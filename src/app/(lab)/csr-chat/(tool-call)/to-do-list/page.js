// Import UI components
import ChatSection from "./chat-section";

export const metadata = {
    title: "Tool Result - Task List",
    description: "a custom tool module test: generate task list by UNO",
};


export default function Page() {
    return (
        <div className="h-svh w-full">
            <ChatSection />
        </div>
    );
}