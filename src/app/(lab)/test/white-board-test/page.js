// Import UI components
import GenerateTextSection from "./sections";

export const metadata = {
    title: "AI SDK Core: generateText",
    description: "AI-Core generate text + Bots chat each other",
};

export default function Page() {
    return (
        <div className="h-svh">
            <GenerateTextSection />
        </div>
    );
}
