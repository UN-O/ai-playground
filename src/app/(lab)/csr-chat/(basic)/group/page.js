// Import UI components
import GroupSection from "./group-section";

export const metadata = {
    title: "Client Side Rendering Group Chat",
    description: "use `createStreamableValue` from ai-sdk-rsc and cut messages by Senba",
};


export default function Page() {
    return (
        <div className="h-svh w-full">
            <GroupSection />
        </div>
    );
}