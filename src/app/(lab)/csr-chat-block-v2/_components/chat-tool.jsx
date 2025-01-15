import { useToolsStore } from '../_utils/tools-store';

import { RenderMarkdown } from "@/utils/rendering"
import EquaComponent from "./tool-call/equa-component"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';



const BLOCKTOOLNAMES = [
    "create_step_block"
]

export function ToolCall({ toolName, args }) {
    switch (toolName) {
        case 'calculate':
            return (null);
        case 'answer': {
            return (
                <>
                    <p className="font-mono text-xs uppercase text-stone-500 text-right">calculation steps</p>
                    <Accordion type="multiple" collapsible className="bg-stone-800 text-secondary font-mono text-sm p-2 rounded-lg mb-2">
                        <div className="space-y-1">
                            {args.steps.map((step, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <div className="grid gap-1" key={index}>
                                        <AccordionTrigger className="flex gap-1">
                                            <div className="font-bold px-2">
                                                step
                                                <br />
                                                {index + 1}
                                            </div>
                                            <div className="w-full h-full flex px-3 place-items-center">
                                                {step.calculation}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="p-2 py-6 text-stone-400">{step.reasoning}</div>
                                        </AccordionContent>
                                    </div>
                                </AccordionItem>
                            ))}
                        </div>


                    </Accordion>
                </>
            );
        }
        case 'plot': {
            return (
                <>
                    <EquaComponent equation={args.equation} />
                    {args.steps.map((step, index) => (
                        <div key={index} className="bg-stone-800 font-mono text-sm p-2 rounded text-secondary">
                            <div className="p-2 py-6 text-stone-400">
                                {step.intro}
                            </div>
                            <div className="p-2 py-6 text-stone-400">
                                {step.detail}
                            </div>
                        </div>
                    ))}
                </>
            )
        }
        case 'create_step_block': {
            return (<div className='text-xs py-3 px-1'>正在幫你詳細解答...</div>
            )
        }
        default: {
            return (
                <div className="bg-stone-900 font-mono p-3 rounded text-secondary max-w-md text-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl">
                    <div className="w-full h-fit overflow-x-auto break-words">
                        <strong>Tool Call:</strong> {toolName}
                        <br />
                        <strong>Arguments:</strong>
                        <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(args, null, 2)}</pre>
                    </div>
                </div>

            );
        }
    }
}

export function ToolResult({ toolName, result, toolCallId, isError, toolResultRender }) {

    const { setActiveToolId, setOpenBlock } = useToolsStore();

    if (toolResultRender?.length > 0) {
        console.log("i get here");
        const Component = toolResultRender.find(tool => tool.toolName === toolName).component;
        return <Component result={result} />;
    }

    if (BLOCKTOOLNAMES.includes(toolName)) {
        return (
            <Button
                className='p-2 h-fit font-mono text-xs'
                variant='outline'
                onClick={() => {
                    setActiveToolId(toolCallId)
                    setOpenBlock(true)
                }}
            >
                <div className="bg-green-500 p-1 rounded-md text-white">
                    <File className="w-6 h-6" />
                </div>

                <div className="grid place-content-center h-full p-3">
                    Click to Check Results
                    {isError && <div className="text-red-600">An error occurred</div>}
                </div>

            </Button>
        );
    }

    switch (toolName) {

        // case 'step_answer': {
        //     return (
        //         <div className="w-full">
        //             <p className="font-mono text-xs uppercase text-stone-500 text-right">calculation steps</p>
        //             <Accordion type="multiple" collapsible className="bg-stone-800 text-secondary font-mono text-sm p-2 rounded-lg mb-2 w-full">
        //                 <div className="space-y-1 w-full">
        //                     {result.steps.map((step, index) => (
        //                         <AccordionItem value={`item-${index}`} className="w-full">
        //                             <div className="grid gap-1 w-full" key={index}>
        //                                 <AccordionTrigger className="w-full">
        //                                     <div className="w-full max-w-[100%] flex justify-between gap-1">
        //                                         <div className="w-full h-full sm:max-w-[17rem] flex px-3 place-content-center sm:place-content-start  overflow-x-auto snap-x scroll-ml-6">
        //                                             {/* {step.concept} */}
        //                                             <div className="w-fit">
        //                                                 <RenderMarkdown>
        //                                                     {"\\[" + step.latex_formulas + "\\]"}
        //                                                 </RenderMarkdown>
        //                                             </div>

        //                                         </div>
        //                                         <div className="font-bold px-2 w-10 place-content-center">
        //                                             ({index + 1})
        //                                         </div>
        //                                     </div>
        //                                 </AccordionTrigger>
        //                                 <AccordionContent>
        //                                     <div className="p-2 py-6 text-stone-400">
        //                                         <RenderMarkdown>
        //                                             {step.textual_description}
        //                                         </RenderMarkdown>
        //                                     </div>
        //                                 </AccordionContent>
        //                             </div>
        //                         </AccordionItem>
        //                     ))}
        //                 </div>

        //             </Accordion>
        //             <div className="bg-stone-800 font-mono text-sm p-2 rounded text-secondary">
        //                 <RenderMarkdown>
        //                     {result.notification}
        //                 </RenderMarkdown>
        //             </div>
        //         </div>
        //     );
        // }

        default: {
            return (
                <div className={`bg-${isError ? 'red' : 'green'}-200 text-sm p-2 rounded max-w-md`}>
                    <strong>Tool Result:</strong> {toolName}
                    <br />
                    <strong>Result:</strong> {JSON.stringify(result, null, 2)}
                    {isError && <div className="text-red-600">An error occurred</div>}
                </div>
            );
        }
    }
}
