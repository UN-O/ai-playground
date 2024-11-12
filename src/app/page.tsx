"use client"
// ? temporary useRoute for client side

import Image from "next/image";
import { useRouter } from 'next/navigation'

const ROUTECASES = [
    {
        title: 'CASE 1 : AI-Core generate text + Bots chat each other',
        route: '/core-lab'
    },
    {
        title: 'CASE 2 : AI math draw plot',
        route: '/draw-plot'
    },
    {
        title: 'CASE 3 : AI-rsc StreamableValue multi-step math agent',
        route: '/csr-chat/rsc'
    },
    {
        title: 'CASE 4 : AI-rsc Chemistry agent',
        route: '/chemistry'
    }
];

export default function Home() {
    const router = useRouter();

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                    This is a playground of ai sdk 3.x, select the test case to begin.
                </ol>

                <div className="grid gap-4 w-full font-mono">
                    {ROUTECASES.map(({ title, route }) => (
                        <button
                            key={route}
                            type="button"
                            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                            onClick={() => router.push(route)}
                        >
                            <Image
                                aria-hidden
                                src="https://nextjs.org/icons/globe.svg"
                                alt="Globe icon"
                                width={16}
                                height={16}
                            />
                            {title} →
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}
