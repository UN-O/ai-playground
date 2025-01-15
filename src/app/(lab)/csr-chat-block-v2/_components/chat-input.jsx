import { useRef, useEffect, useState } from "react";
import { useMessagesStore } from "../_utils/messages-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export default function ChatInput({ handleSubmit, selectedText }) {
	const textAreaRef = useRef(null);
	const input = useMessagesStore((state) => state.input);
	const setInput = useMessagesStore((state) => state.setInput);
	const [textAreaRect, setTextAreaRect] = useState(null);

	const handleInputChange = (e) => {
		setInput(e.target.value);
		autoResizeTextarea(e.target);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const autoResizeTextarea = (textarea) => {
		const computedStyle = getComputedStyle(textarea);
		const lineHeight = parseFloat(computedStyle.lineHeight);
		const paddingTop = parseFloat(computedStyle.paddingTop);
		const paddingBottom = parseFloat(computedStyle.paddingBottom);
		const borderTop = parseFloat(computedStyle.borderTopWidth);
		const borderBottom = parseFloat(computedStyle.borderBottomWidth);

		const extraHeight = paddingTop + paddingBottom + borderTop + borderBottom;
		const minHeight = lineHeight + extraHeight;
		const maxHeight = lineHeight * 12 + extraHeight;

		const lines = textarea.value.split("\n").length;
		let newHeight = lineHeight * lines + extraHeight;

		if (newHeight < minHeight) {
			newHeight = minHeight;
		}

		if (newHeight > maxHeight) {
			newHeight = maxHeight;
			textarea.style.overflowY = "scroll";
		} else {
			textarea.style.overflowY = "hidden";
		}

		textarea.style.height = `${newHeight}px`;
	};

	// 更新 Textarea 的位置信息
	useEffect(() => {
		if (textAreaRef.current) {
			const rect = textAreaRef.current.getBoundingClientRect();
			setTextAreaRect(rect);
		}
	}, [selectedText]);

	const handleResize = () => {
		if (textAreaRef.current) {
			const rect = textAreaRef.current.getBoundingClientRect();
			setTextAreaRect(rect);
		}

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	};

	// 監聽視窗的 resize 事件
	window.addEventListener("resize", handleResize);

	useEffect(() => {
		if (textAreaRef.current) {
			autoResizeTextarea(textAreaRef.current);
		}
	}, [input]);

	return (
		<div className="flex flex-col justify-center w-full gap-2 relative">
			{/* 顯示選取文字 */}
			{selectedText && textAreaRect && (
				<div
					className="absolute top-[-2rem] left-0 px-4 py-2 bg-gray-300 text-black rounded-t-md shadow-md overflow-hidden whitespace-nowrap text-ellipsis"
					style={{
						width: textAreaRect.width,
					}}
				>
					<span className="text-xs font-bold inline">回覆：</span>
					<span className="text-xs inline">{selectedText}</span>
				</div>
			)}

			<div className="w-full gap-2 flex justify-between items-start">
				<Textarea
					ref={textAreaRef}
					value={input}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder="Type a message..."
					style={{
						resize: "none",
						boxSizing: "border-box",
					}}
					className="p-4 h-14 resize-none box-border"
				/>
				<Button onClick={handleSubmit} className="h-12">
					<Send className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
