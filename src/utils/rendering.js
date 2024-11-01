import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";


export function RenderMarkdown({ children }) {
    return (
        <Markdown
            remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            components={{ code: processCode }}
        >
            {fixKatex(children)}
        </Markdown>
    );
}

function fixKatex(text) {
    return text.replace(/\\\((.*?)\\\)/g, '$$$1$$').replace(/\\\[(.*?)\\\]/gs, '\n$$$$\n$1\n$$$$\n').replace(/ *\$\$ (?!\n)([\s\S]*?)(?!\n\s*)\$\$ */g, "   $$$$\n   $1\n   $$$$");
}

function processCode({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');

    function handleCopyCode(code) {
        navigator.clipboard.writeText(code)
            .catch(err => {
                console.error("Error copying text: ", err);
            });
    }

    return !inline && match ? (
        // TODO: Padding does not work on the right
        <div className="relative mb-5">
            <div className="flex justify-between items-center bg-black text-white py-2 px-4 rounded-t-md">
                <span className="text-sm">{match[1]}</span>
                <div className="flex items-center">
                    <button onClick={() => handleCopyCode(String(children).replace(/\n$/, ''))}
                        className="ml-2 text-gray-300 hover:text-white focus:outline-none transition duration-300 ease-in-out">
                        Copy
                    </button>
                </div>
            </div>
            <SyntaxHighlighter style={tomorrow} language={match[1]} showLineNumbers wrapLines PreTag="div" {...props} customStyle={{ marginTop: '0px' }}>
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className={`${className} tile-border-rounded-inline font-jb-mono`} {...props}>
            {children}
        </code>
    );
}