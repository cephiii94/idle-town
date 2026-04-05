**Peran**: Kamu adalah Senior Fullstack Web & Game Developer.

**Tugas**: Buatkan kerangka awal aplikasi web app "Idle-Town" menggunakan teknologi berikut:

1. Framework: Next.js (gunakan App Router terbaru).
2. Database & Auth: Supabase (berikan contoh inisialisasi client dan auth sederhana).
3. AI Engine: Together.ai API (gunakan untuk fitur chat asisten).
4. Styling: Tailwind CSS.

**Fitur Spesifik yang Harus Dibuat**:

1. File .env.example: Buatkan daftar environment variables yang dibutuhkan (Supabase URL, Supabase Anon Key, dan Together API Key).
2. Supabase Client (lib/supabase.js): Kode untuk menyambungkan aplikasi dengan database Supabase.
3. API Route (app/api/chat/route.js): Buat endpoint POST yang menerima teks dari player. Gunakan fetch standar (tanpa SDK Together jika memungkinkan agar ringan) untuk memanggil model meta-llama/Llama-3-8b-chat-hf dari Together.ai. Berikan system prompt ke AI agar mendeteksi kata "kumpulkan", "jumlah", dan "item", lalu memaksa output dalam bentuk JSON (contoh: { "reply": "Pesan", "action": "FARM", "item": "kayu", "amount": 100 }).
4. Halaman Utama (app/page.js): UI sederhana dengan React state yang berisi:
    - Indikator resource player (contoh: Kayu: 0, Buah: 0).
    - Kotak chat untuk berbicara dengan asisten.
    - Fungsi untuk mengirim pesan ke API dan meng-update resource jika balasan AI berupa perintah FARM.

**Aturan Koding (WAJIB):**

- Tulis kode sebersih mungkin (clean code).
- Berikan komentar berbahasa Indonesia di setiap baris atau blok penting untuk menjelaskan fungsi kode tersebut kepada pemula.
- Pastikan penanganan error (Try/Catch) diimplementasikan, terutama saat memanggil API eksternal.