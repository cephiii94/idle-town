const fs = require('fs');

async function listLlamaModels() {
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
  const llamas = data.filter(m => m.id.toLowerCase().includes('llama-3-8b'));
  console.log('Llama-3-8B Models:', JSON.stringify(llamas.map(m => m.id), null, 2));
}

listLlamaModels();
