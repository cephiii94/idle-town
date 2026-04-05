const fs = require('fs');

async function listGemmaModels() {
  const envContent = fs.readFileSync('d:\\ERLIN\\CECEP\\idle-town\\.env', 'utf8');
  const apiKeyLine = envContent.split('\n').find(line => line.startsWith('TOGETHER_API_KEY='));
  const apiKey = apiKeyLine.split('=')[1].trim();

  const response = await fetch("https://api.together.xyz/v1/models", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  const data = await response.json();
  const gemmaModels = data.filter(m => m.id.toLowerCase().includes('gemma'));
  console.log('Gemma Models:', JSON.stringify(gemmaModels.map(m => m.id), null, 2));
}

listGemmaModels();
