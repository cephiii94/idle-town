const fs = require('fs');

async function listGemma4bModels() {
  const envContent = fs.readFileSync('d:\\ERLIN\\CECEP\\idle-town\\.env', 'utf8');
  const apiKeyLine = envContent.split('\n').find(line => line.startsWith('TOGETHER_API_KEY='));
  if (!apiKeyLine) {
    console.error('TOGETHER_API_KEY not found in .env');
    return;
  }
  const apiKey = apiKeyLine.split('=')[1].trim();

  const response = await fetch("https://api.together.xyz/v1/models", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  const data = await response.json();
  const gemma4b = data.filter(m => m.id.toLowerCase().includes('gemma') && m.id.toLowerCase().includes('4b'));
  console.log('Gemma 4B Models:', JSON.stringify(gemma4b.map(m => m.id), null, 2));
}

listGemma4bModels();
