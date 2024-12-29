"use client"; // <-- 在 Next.js 13+ 的 App Router 環境中使用 client component
import { useState } from 'react';
import { useMessagesStore } from '../messages-store';
import { useToolsStore } from '../tools-store';

import { RenderMarkdown } from "@/utils/rendering"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StepAnswer({ id, executeConversation }) {
	// 這邊父層還是取到 result，但是不直接 map steps 的資料，而是用 index 來生成 <StepItem />
	const notification = useToolsStore((state) => state.toolResults[id].result?.notification);
	const steplength = useToolsStore((state) => state.toolResults[id].result?.steps?.length);
	const setInput = useMessagesStore((state) => state.setInput);
	const appendMessage = useMessagesStore((state) => state.appendMessage);

	// 這些 callback 保持在父層，以便傳給子層使用
	const handleBug = (index, step) => {
		setInput(`第 ${index} 步驟有問題，你寫的 $${step.latex_formulas}$ ，我覺得...`);
	};

	const handleExplanation = async (index, step) => {
		const inputMessage = {
			role: 'user',
			content: [{ type: 'text', text: `我想更了解第 ${index} 步驟的推導` }],
		};
		const submitMessage = {
			role: 'user',
			content: [
				{
					type: 'text',
					text: `使用三個段落來進行詳細解釋第 ${index} 步驟的推導...(省略)...請保持嚴謹的論述，但語氣保持幽默`,
				},
			],
		};
		appendMessage(inputMessage);
		await executeConversation([submitMessage]);
	};

	const handleStepReview = async (index, step) => {
		const inputMessage = {
			role: 'user',
			content: [{ type: 'text', text: `第 ${index} 步驟的推導，是怎麼從前一步驟來的?` }],
		};
		const submitMessage = {
			role: 'user',
			content: [
				{
					type: 'text',
					text: `第 ${index} 步驟的推導，是怎麼從前一步驟來的? 請解釋步驟中的操作概念...`,
				},
			],
		};
		appendMessage(inputMessage);
		await executeConversation([submitMessage]);
	};

	return (
		<div className="w-full">
			{(
				<div className="mr-3">
					<p className="font-mono text-xs uppercase text-stone-500 text-right">calculation steps</p>
					<Accordion type="multiple" className="text-secondary font-mono text-sm p- rounded-lg mb-2 w-full">
						<div className="w-full space-y-2">
							{/* 父層只知道 steps 的長度，但不直接取 steps 的每一筆 */}
							{steplength && Array.from({ length: steplength }).map((_, index) => (<StepItem
								key={index}
								index={index}
								id={id}
								handleBug={handleBug}
								handleStepReview={handleStepReview}
								handleExplanation={handleExplanation}
							/>))}
						</div>
					</Accordion>

					<div className="bg-stone-800 font-mono text-sm p-2 rounded text-secondary">
						{notification && (
							<RenderMarkdown>
								{notification}
							</RenderMarkdown>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

/**
 * 單獨訂閱某一個步驟的 component
 * 只要這個步驟的內容沒改變，就不會重新渲染
 */
function StepItem({
	id,
	index,
	handleBug,
	handleStepReview,
	handleExplanation,
}) {
	// 在這裡只訂閱特定 index 的 step
	const step = useToolsStore((state) => state.toolResults[id].result?.steps[index]);

	if (!step) return null; // 如果該步驟不存在，就不渲染

	return (
		<AccordionItem
			value={`item-${index}`}
			className="relative w-full bg-stone-800 border border-stone-700 rounded-md"
		>
			<div className="grid h-full w-full group rounded-md">
				<AccordionTrigger className="w-full min-h-28">
					<div className="w-full h-full grid grid-cols-8 justify-between gap-1">
						<div className="col-span-7 w-full h-full flex px-3 place-content-start overflow-x-auto items-center">
							<ScrollArea className="w-full h-fit horizontal">
								{step && (
									<div className="w-fit">
										<RenderMarkdown>
											{"\\[" + step.latex_formulas + "\\]"}
										</RenderMarkdown>
									</div>
								)}
								<ScrollBar orientation="horizontal" />
							</ScrollArea>
						</div>
						<div className="col-end-9 font-bold px-2 w-full place-items-center flex justify-end">
							({index + 1})
						</div>
					</div>
				</AccordionTrigger>

				{/* hover 出現的按鈕區域 */}
				<div className="absolute top-3 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transform -translate-y-1/2 transition-opacity duration-200">
					<Button
						className="bg-gray-500 text-white text-xs rounded hover:bg-gray-700"
						onClick={() => handleBug(index + 1, step)}
					>
						這一步怪怪的?
					</Button>

					<Button
						className="bg-gray-500 text-white text-xs rounded hover:bg-gray-700"
						onClick={() => handleStepReview(index + 1, step)}
					>
						等等，這中間發生了啥?
					</Button>

					<Button
						className="bg-gray-500 text-white text-xs rounded hover:bg-gray-700"
						onClick={() => handleExplanation(index + 1, step)}
					>
						幫我解釋一下
					</Button>

					<CopyButton step={step} />
				</div>

				{step.textual_description && (
					<AccordionContent>
						<div className="p-2 py-6 text-stone-500">
							<RenderMarkdown>
								{step.textual_description}
							</RenderMarkdown>
						</div>
					</AccordionContent>
				)}
			</div>
		</AccordionItem>
	);
}

/**
 * 複製 latex_formulas 的按鈕
 */
function CopyButton({ step }) {
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = (text) => {
		if (!text) return;
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setIsCopied(true);
				setTimeout(() => setIsCopied(false), 2000);
			})
			.catch((err) => console.error("複製失敗", err));
	};

	return (
		<Button
			className="bg-blue-500 text-white text-xs rounded hover:bg-blue-700"
			onClick={() => handleCopy(step?.latex_formulas)}
		>
			{isCopied ? (
				<Check className="w-4 h-4" />
			) : (
				<Copy className="w-4 h-4" />
			)}
		</Button>
	);
}
