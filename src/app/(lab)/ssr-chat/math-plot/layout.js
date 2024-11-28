import { AI } from "./action";

// CSS
import "./plot.css";

// Metadata
export const metadata = {
    title: "Draw Plot in ReactNode",
    description: "Draw plot in RSC return ReactNode. (Senba)",
};



export default function Layout({ children }) {
    return (
        <AI>
            {children}
        </AI>
    )
}