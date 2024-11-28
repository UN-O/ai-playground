import { AI } from "./action";

// Metadata
export const metadata = {
    title: "RSC Group Chat V1",
    description: "Chat in RSC return ReactNode cut every sentence with <br />. (Senba)",
};



export default function Layout({ children }) {
    return (
        <AI>
            {children}
        </AI>
    )
}