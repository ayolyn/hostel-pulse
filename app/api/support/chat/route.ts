import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Missing messages array" }, { status: 400 });
        }

        const formattedMessages = messages.map((msg: any) => ({
            role: msg.sender_role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        const systemPrompt = "You are the HostelPulse AI Support Assistant. You are a friendly, highly professional customer support agent helping users (students, landlords, and agents) find secure accommodation, navigate the Campus Market, manage properties, and find roommates in Ogbomoso. You know that all payments are secured via the HostelPulse Escrow Shield. Keep answers concise, formatting them with line breaks for readability. Never hallucinate features. If a user asks about a critical dispute, scam, or payment failure, politely instruct them to click the 'Escalate to Human/Dispute' button so an admin can step in.";

        formattedMessages.unshift({ role: 'system', content: systemPrompt });

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: formattedMessages as any,
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(new TextEncoder().encode(content));
                    }
                }
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error("OpenAI Error:", error);
        return NextResponse.json({ error: "Failed to process message." }, { status: 500 });
    }
}
