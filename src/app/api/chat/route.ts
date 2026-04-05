import { NextResponse } from 'next/server';

// Bersihkan konfigurasi Together AI (gunakan model meta-llama/Llama-3-8b-chat-hf)
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const MODEL = "meta-llama/Meta-Llama-3-8B-Instruct-Lite";

export async function POST(req: Request) {
  try {
    const { message, villagerStats } = await req.json();

    if (!TOGETHER_API_KEY) {
      return NextResponse.json({ error: 'API Key Together AI belum dikonfigurasi' }, { status: 500 });
    }

    // Buat representasi status penduduk untuk AI
    const statusContext = villagerStats && Array.isArray(villagerStats)
      ? `Current Villagers Status:
${villagerStats.map((v: any) => `- ${v.name} (Emoji: ${v.emoji}, HP: ${Math.round(v.hp)}%, Status: ${v.state})`).join('\n')}`
      : 'No villager status available.';

    // System prompt untuk Context Awareness
    const systemPrompt = `
      You are the Idle Town game assistant. 
      You are helpful, creative, and know your villagers.
      
      ${statusContext}
      
      RULES:
      1. ONLY output valid JSON. No markdown blocks.
      2. If a player asks a specific villager (e.g. "Budi"), specify it in "target_villager".
      3. If a villager has HP < 20, they are too tired. Inform the player in "reply" and DON'T assign them work.
      
      Response Format:
      {
        "reply": "Your response in Bahasa Indonesia (be persona-driven)",
        "actions": [
          { "action": "FARM", "item": "kayu" | "buah" | "batu", "target_villager": "Name" | null, "amount": 25 },
          ...
        ]
      }
    `;

    // Panggil API Together AI menggunakan fetch standar
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    const data = await response.json();

    // Pastikan menangani error dari API Together
    if (data.error) {
      throw new Error(data.error.message || 'Error dari API Together');
    }

    // Ambil teks hasil respons AI
    let content = data.choices[0].message.content.trim();

    // Logika tambahan: Bersihkan markdown code blocks jika ada
    // Seringkali model AI membungkus JSON dalam ```json ... ```
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    // Coba parse content sebagai JSON
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (parseError) {
      // Jika tetap gagal parse, kirim sebagai pesan biasa (fallback)
      return NextResponse.json({
        reply: content,
        action: "NONE",
        item: null,
        amount: 0
      });
    }

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
