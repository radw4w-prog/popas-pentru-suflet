// backend/services/multiAIService.js
const axios = require('axios');

/*
 ════════════════════════════════════════════════
 MULTI-PROVIDER AI SERVICE
 ════════════════════════════════════════════════
 Prioritate:
   1. OpenRouter (15+ modele free)
   2. Mistral Large (cel mai bun pentru română)
   3. Cerebras (cel mai rapid)
   4. Hugging Face RoLlama3 (model românesc)
   5. Groq (backup rapid)
   6. Gemini (backup final)
 
 Fallback automat când un provider rate-limitează sau cade.
*/

// ═══════════════════════════════════════
// CONFIGURARE PROVIDERI
// ═══════════════════════════════════════
const PROVIDERS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: process.env.OPENROUTER_API_KEY,
    models: [
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
      'deepseek/deepseek-chat-v3:free',
      'qwen/qwen-2.5-72b-instruct:free'
    ],
    maxTokens: 4096,
    temperature: 0.3,
    rateLimit: 20, // req/min
    costPer1k: 0 // free
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY,
    models: [
      'mistral-large-latest',
      'open-mistral-nemo',
      'mistral-small-latest'
    ],
    maxTokens: 4096,
    temperature: 0.3,
    rateLimit: 10,
    costPer1k: 0
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    endpoint: 'https://api.cerebras.ai/v1/chat/completions',
    apiKey: process.env.CEREBRAS_API_KEY,
    models: [
      'llama-3.3-70b',
      'llama-3.1-8b'
    ],
    maxTokens: 4096,
    temperature: 0.3,
    rateLimit: 30,
    costPer1k: 0
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    endpoint: 'https://api-inference.huggingface.co/models/OpenLLM-Ro/RoLlama3-8b-Instruct',
    apiKey: process.env.HF_API_KEY,
    models: ['OpenLLM-Ro/RoLlama3-8b-Instruct'],
    maxTokens: 4096,
    temperature: 0.3,
    rateLimit: 10,
    costPer1k: 0
  },
  {
    id: 'groq',
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: process.env.GROQ_API_KEY,
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant'
    ],
    maxTokens: 4096,
    temperature: 0.3,
    rateLimit: 30,
    costPer1k: 0
  },
  {
    id: 'gemini',
    name: 'Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    apiKey: process.env.GEMINI_API_KEY,
    models: ['gemini-2.0-flash'],
    maxTokens: 4096,
    temperature: 0.3,
    rateLimit: 60,
    costPer1k: 0
  }
];

// ═══════════════════════════════════════
// TRACKING UTILIZARE
// ═══════════════════════════════════════
const usageStats = {
  totalRequests: 0,
  providerStats: {},
  lastReset: Date.now()
};

PROVIDERS.forEach(p => {
  usageStats.providerStats[p.id] = {
    success: 0,
    errors: 0,
    rateLimited: 0,
    lastCall: null
  };
});

function resetStatsIfNeeded() {
  const oneHour = 3600000;
  if (Date.now() - usageStats.lastReset > oneHour) {
    PROVIDERS.forEach(p => {
      usageStats.providerStats[p.id] = {
        success: 0,
        errors: 0,
        rateLimited: 0,
        lastCall: null
      };
    });
    usageStats.totalRequests = 0;
    usageStats.lastReset = Date.now();
  }
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getOpenAIMessages(prompt, systemPrompt = '') {
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });
  return messages;
}

function normalizeResponse(provider, rawResponse) {
  // OpenRouter, Mistral, Cerebras, Groq → OpenAI format
  if (provider.id !== 'gemini' && provider.id !== 'huggingface') {
    return rawResponse.data.choices?.[0]?.message?.content || '';
  }

  // Gemini format
  if (provider.id === 'gemini') {
    return rawResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // Hugging Face format
  if (provider.id === 'huggingface') {
    if (Array.isArray(rawResponse.data)) {
      return rawResponse.data[0]?.generated_text || '';
    }
    return rawResponse.data?.generated_text || '';
  }

  return '';
}

// ═══════════════════════════════════════
// VERIFICĂ CONFIGURARE
// ═══════════════════════════════════════
function getConfiguredProviders() {
  return PROVIDERS.filter(p => p.apiKey && p.apiKey.startsWith('sk-') || p.apiKey.startsWith('hf_') || p.apiKey.length > 10);
}

function logProviderUsage(providerId, success, errorType = null) {
  resetStatsIfNeeded();
  usageStats.totalRequests++;
  const stats = usageStats.providerStats[providerId];
  stats.lastCall = Date.now();

  if (success) {
    stats.success++;
  } else {
    stats.errors++;
    if (errorType === 'rate_limit') {
      stats.rateLimited++;
    }
  }

  // Log la fiecare 100 request-uri
  if (usageStats.totalRequests % 100 === 0) {
    console.log('📊 AI Usage Stats:', usageStats.providerStats);
  }
}

// ═══════════════════════════════════════
// GENERARE CU FALLBACK
// ═══════════════════════════════════════
async function tryProvider(provider, messages, maxTokens, temperature, attempt = 1) {
  const config = {
    method: 'post',
    url: provider.endpoint,
    headers: {
      'Content-Type': 'application/json',
      ...(provider.id === 'huggingface' ? { 'Authorization': `Bearer ${provider.apiKey}` } : {}),
      ...(provider.id === 'gemini' ? { 'x-goog-api-key': provider.apiKey } : {
        'Authorization': `Bearer ${provider.apiKey}`
      })
    },
    timeout: 60000, // 60 sec timeout
    maxRedirects: 0
  };

  // OpenAI-compatible providers
  if (provider.id !== 'gemini' && provider.id !== 'huggingface') {
    config.data = {
      model: provider.models[0],
      messages,
      max_tokens: maxTokens,
      temperature: temperature,
      stream: false
    };
  }

  // Gemini
  if (provider.id === 'gemini') {
    config.data = {
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature
      }
    };
  }

  // Hugging Face
  if (provider.id === 'huggingface') {
    config.data = {
      inputs: messages[messages.length - 1].content,
      parameters: {
        max_new_tokens: maxTokens,
        temperature: temperature,
        return_full_text: false
      }
    };
  }

  try {
    const response = await axios(config);
    const content = normalizeResponse(provider, response);

    if (!content || content.trim().length < 10) {
      throw new Error('Răspuns prea scurt de la AI');
    }

    logProviderUsage(provider.id, true);
    console.log(`✅ AI [${provider.name}]: ${content.substring(0, 80)}... (${content.length} chars)`);

    return {
      success: true,
      content,
      provider: provider.id,
      model: provider.models[0],
      tokens: content.length
    };

  } catch (err) {
    const status = err.response?.status;
    const errorMsg = err.response?.data?.error?.message || err.message;

    // Rate limit
    if (status === 429 || errorMsg.includes('rate limit') || errorMsg.includes('TPD')) {
      logProviderUsage(provider.id, false, 'rate_limit');
      console.log(`⚠️ Rate limit [${provider.name}]. Încerc următorul...`);
      return { success: false, error: 'rate_limit', provider: provider.id };
    }

    // Auth error
    if (status === 401 || status === 403) {
      logProviderUsage(provider.id, false, 'auth_error');
      console.log(`❌ Auth error [${provider.name}]: ${errorMsg}`);
      return { success: false, error: 'auth_error', provider: provider.id };
    }

    // Server error
    if (status >= 500) {
      logProviderUsage(provider.id, false, 'server_error');
      console.log(`❌ Server error [${provider.name}]: ${status}`);
      return { success: false, error: 'server_error', provider: provider.id };
    }

    // Other errors
    logProviderUsage(provider.id, false, 'other_error');
    console.log(`❌ Error [${provider.name}]: ${errorMsg}`);
    return { success: false, error: errorMsg, provider: provider.id };
  }
}

// ═══════════════════════════════════════
// API PUBLIC — ÎNLOCUIEȘTE geminiService.js
// ═══════════════════════════════════════

/**
 * Generează text cu AI, cu fallback automat între provideri
 * @param {string} prompt - Prompt-ul complet
 * @param {number} maxTokens - Max tokens (default 4096)
 * @param {number} temperature - Temperatură (default 0.3)
 * @param {string} systemPrompt - System prompt opțional
 * @returns {Promise<string>} Textul generat
 */
async function generate(prompt, maxTokens = 4096, temperature = 0.3, systemPrompt = '') {
  const configured = getConfiguredProviders();

  if (configured.length === 0) {
    throw new Error('Niciun provider AI configurat. Verifică .env');
  }

  console.log(`🤖 AI Request: ${prompt.substring(0, 100)}... | Providers: ${configured.map(p => p.id).join(', ')}`);

  const messages = getOpenAIMessages(prompt, systemPrompt);

  // Încearcă fiecare provider în ordine
  for (let i = 0; i < configured.length; i++) {
    const provider = configured[i];

    // Verifică rate limit
    const stats = usageStats.providerStats[provider.id];
    if (stats.rateLimited >= 3) {
      console.log(`🚫 ${provider.name} blocat temporar (3+ rate limits)`);
      continue;
    }

    try {
      const result = await tryProvider(provider, messages, maxTokens, temperature);

      if (result.success) {
        return result.content;
      }

      if (result.error === 'rate_limit') {
        // Wait exponential backoff
        const waitTime = Math.min(5000 * Math.pow(2, stats.rateLimited), 30000);
        console.log(`# ${waitTime}ms before retry...`);
        await sleep(waitTime);
      }

      // Continue cu următorul provider
      continue;

    } catch (err) {
      console.log(`❌ Unexpected error with ${provider.name}:`, err.message);
      continue;
    }
  }

  // Dacă niciunul nu a funcționat
  throw new Error(`Toți providerii AI au eșuat. Ultimul error: ${configured[configured.length - 1].id}`);
}

/**
 * Verifică dacă un provider e configurat
 */
function isConfigured() {
  return getConfiguredProviders().length > 0;
}

/**
 * Returnează statistici de utilizare
 */
function getUsageStats() {
  resetStatsIfNeeded();
  return {
    total: usageStats.totalRequests,
    providers: usageStats.providerStats
  };
}

module.exports = {
  generate,
  isConfigured,
  getUsageStats,
  PROVIDERS,
  getConfiguredProviders
};