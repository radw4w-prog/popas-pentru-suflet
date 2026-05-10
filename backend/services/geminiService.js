// backend/services/geminiService.js
const axios = require('axios');

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768'
];

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemma-3-27b-it',
  'gemma-3-12b-it',
  'gemma-3-4b-it'
];

class AIService {
  constructor() {
    this.http = axios.create({ timeout: 60000 });
    this.lastRequestTime = 0;
    this.MIN_INTERVAL = 500;
    this.exhaustedModels = new Map();
    this.EXHAUSTED_COOLDOWN = 5 * 60 * 1000; // 5 minute
  }

  get geminiKey() { return process.env.GEMINI_API_KEY?.trim(); }
  get groqKey() { return process.env.GROQ_API_KEY?.trim(); }

  isConfigured() {
    const ok = !!(this.geminiKey || this.groqKey);
    console.log('🔑 isConfigured:', ok, '| Groq:', !!this.groqKey, '| Gemini:', !!this.geminiKey);
    return ok;
  }

  isModelExhausted(id) {
    if (!this.exhaustedModels.has(id)) return false;
    if (Date.now() - this.exhaustedModels.get(id) > this.EXHAUSTED_COOLDOWN) {
      this.exhaustedModels.delete(id);
      return false;
    }
    return true;
  }

  markExhausted(id) {
    this.exhaustedModels.set(id, Date.now());
    console.log(`🚫 ${id} cooldown 5 min`);
  }

  resetExhaustedModels() {
    this.exhaustedModels.clear();
    console.log('♻️ Toate modelele resetate');
  }

  getModelsStatus() {
    return [
      ...GROQ_MODELS.map(m => ({ model: m, provider: 'groq', status: this.isModelExhausted(m) ? 'cooldown' : 'available' })),
      ...GEMINI_MODELS.map(m => ({ model: m, provider: 'gemini', status: this.isModelExhausted(m) ? 'cooldown' : 'available' }))
    ];
  }




async generateDevotional(prompt, maxTokens = 2000) {
  if (!this.isConfigured()) {
    throw new Error('Nicio cheie AI configurată');
  }

  await this.waitRateLimit();

  // 1. Gemini primul — mai bun pentru texte devoționale
  const geminiResult = await this.tryGemini(prompt, maxTokens);
  if (geminiResult) {
    const modelUsed = GEMINI_MODELS.find(m => !this.isModelExhausted(m)) || 'gemini';
    console.log(`✅ Devotional generat cu Gemini: ${modelUsed}`);
    return { text: geminiResult, model: modelUsed, provider: 'gemini' };
  }

  // 2. Groq fallback
  const groqResult = await this.tryGroq(prompt, maxTokens);
  if (groqResult) {
    const modelUsed = GROQ_MODELS.find(m => !this.isModelExhausted(m)) || 'llama';
    console.log(`✅ Devotional generat cu Groq: ${modelUsed}`);
    return { text: groqResult, model: modelUsed, provider: 'groq' };
  }

  throw new Error('Toate modelele AI sunt temporar indisponibile.');
}



  async waitRateLimit() {
    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < this.MIN_INTERVAL) {
      await new Promise(r => setTimeout(r, this.MIN_INTERVAL - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  async tryGroq(prompt, maxTokens) {
    if (!this.groqKey) {
      console.log('⚠️ GROQ_API_KEY lipsă!');
      return null;
    }

    const available = GROQ_MODELS.filter(m => !this.isModelExhausted(m));
    console.log(`⚡ Groq modele disponibile: ${available.join(', ')}`);

    for (const model of available) {
      try {
        console.log(`⚡ Încerc Groq: ${model}`);

        const r = await this.http.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: 0.85
          },
          {
            headers: {
              'Authorization': `Bearer ${this.groqKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        const text = r.data?.choices?.[0]?.message?.content;
        if (!text) { console.log(`⚠️ Groq ${model}: răspuns gol`); continue; }

        console.log(`✅ Groq succes: ${model}`);
        return text.trim();

      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.error?.message || error.message;
        console.log(`❌ Groq ${model}: [${status}] ${msg}`);

        if (status === 429 || status === 413) {
          this.markExhausted(model);
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        if (status === 401) {
          console.error('❌ GROQ_API_KEY invalid!');
          return null;
        }
        continue;
      }
    }

    return null;
  }

  async tryGemini(prompt, maxTokens) {
    if (!this.geminiKey) {
      console.log('⚠️ GEMINI_API_KEY lipsă!');
      return null;
    }

    const available = GEMINI_MODELS.filter(m => !this.isModelExhausted(m));
    console.log(`🤖 Gemini modele disponibile: ${available.join(', ')}`);

    for (const model of available) {
      try {
        console.log(`🤖 Încerc Gemini: ${model}`);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey}`;
        const r = await this.http.post(url, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
  temperature: 0.85,
  maxOutputTokens: maxTokens,
  topP: 0.92,
  topK: 40,
  responseMimeType: 'application/json'
}
        }, { timeout: 60000 });

        const text = r.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) { console.log(`⚠️ Gemini ${model}: răspuns gol`); continue; }

        console.log(`✅ Gemini succes: ${model}`);
        return text.trim();

      } catch (error) {
        const status = error.response?.status;
        console.log(`❌ Gemini ${model}: [${status}]`);

        if (status === 429) { this.markExhausted(model); await new Promise(r => setTimeout(r, 2000)); continue; }
        if (status === 404) { this.markExhausted(model); continue; }
        continue;
      }
    }

    return null;
  }

  async generate(prompt, maxTokens = 2000) {
    if (!this.isConfigured()) {
      throw new Error('Nicio cheie AI configurată');
    }

    await this.waitRateLimit();

    // 1. Groq - prioritate (mai rapid)
    const groqResult = await this.tryGroq(prompt, maxTokens);
    if (groqResult) return groqResult;

    // 2. Gemini - fallback
    const geminiResult = await this.tryGemini(prompt, maxTokens);
    if (geminiResult) return geminiResult;

    throw new Error('Toate modelele AI sunt temporar indisponibile. Încearcă în câteva minute.');
  }

  async generatePostContent(verset, referinta, tema, platform) {
    const platformGuide = {
      facebook: { name: 'Facebook', maxLen: 500, style: 'storytelling, personal, cald, cu o întrebare la final' },
      instagram: { name: 'Instagram', maxLen: 350, style: 'emoțional, scurt, vizual, cu emoji-uri' },
      tiktok: { name: 'TikTok', maxLen: 180, style: 'hook puternic, scurt, direct' }
    };

    const p = platformGuide[platform] || platformGuide.facebook;

    const prompt = `Ești un creator de conținut creștin pentru ${p.name} în România.

VERSET: "${verset}"
REFERINȚĂ: ${referinta}
TEMA: ${tema}

Returnează DOAR JSON valid, fără text înainte sau după:
{
  "hook": "Prima propoziție captivantă, max 15 cuvinte, cu emoji",
  "descriere": "Textul postării, stil ${p.style}, max ${p.maxLen} caractere, include versetul natural",
  "cta": "Call to action, o propoziție",
  "hashtags_principale": ["credinta", "rugaciune", "dumnezeu", "isus", "biblie"],
  "hashtags_nisa": ["versetulzilei", "crestin", "evanghelie", "hristos", "mantuire", "har", "iubire", "pace"],
  "hashtags_brand": ["PopasPentruSuflet", "VersetulZilei", "BibliaCornilescu"],
  "story_text": "Max 6 cuvinte impactante",
  "varianta_calda": "Versiune intimă, max ${p.maxLen} caractere",
  "varianta_puternica": "Versiune inspirațională, max ${p.maxLen} caractere",
  "ora_recomandata_dimineata": "07:00",
  "ora_recomandata_seara": "19:00",
  "motiv_ore": "Ore cu engagement maxim pentru creștinii din România",
  "emoji_tema": "🙏 ❤️ ✝️ 📖 🕊️",
  "sfat_imagine": "Sugestie pentru imagine, max 15 cuvinte"
}`;

    const raw = await this.generate(prompt, 2500);

    try {
      let jsonStr = raw;
      const blockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (blockMatch) {
        jsonStr = blockMatch[1].trim();
      } else {
        const first = raw.indexOf('{');
        const last = raw.lastIndexOf('}');
        if (first !== -1 && last > first) jsonStr = raw.substring(first, last + 1);
      }

      jsonStr = jsonStr.replace(/\n/g, ' ').replace(/\r/g, '');
      const parsed = JSON.parse(jsonStr);

      const allHashtags = [
        ...(parsed.hashtags_principale || []).map(h => '#' + h.replace(/^#/, '')),
        ...(parsed.hashtags_nisa || []).map(h => '#' + h.replace(/^#/, '')),
        ...(parsed.hashtags_brand || []).map(h => '#' + h.replace(/^#/, ''))
      ].filter(Boolean);

      return {
        hook: parsed.hook || '',
        descriere: parsed.descriere || '',
        cta: parsed.cta || '',
        hashtags: [...new Set(allHashtags)].join(' '),
        hashtagsPrincipale: parsed.hashtags_principale || [],
        hashtagsNisa: parsed.hashtags_nisa || [],
        hashtagsBrand: parsed.hashtags_brand || [],
        storyText: parsed.story_text || '',
        variantaCalda: parsed.varianta_calda || '',
        variantaPuternica: parsed.varianta_puternica || '',
        oraDimineata: parsed.ora_recomandata_dimineata || '07:00',
        oraSeara: parsed.ora_recomandata_seara || '19:00',
        motivOre: parsed.motiv_ore || '',
        emojiTema: parsed.emoji_tema || '🙏 ❤️ ✝️ 📖 🕊️',
        sfatImagine: parsed.sfat_imagine || '',
        platform,
        aiGenerated: true,
        parseError: false
      };

    } catch (parseError) {
      console.error('❌ Parse JSON error:', parseError.message);
      return {
        hook: '',
        descriere: raw.substring(0, 500),
        cta: '',
        hashtags: '#PopasPentruSuflet #VersetulZilei #Credinta #Dumnezeu #Isus #Rugaciune',
        hashtagsPrincipale: [],
        hashtagsNisa: [],
        hashtagsBrand: ['PopasPentruSuflet'],
        storyText: '',
        variantaCalda: '',
        variantaPuternica: '',
        oraDimineata: '07:00',
        oraSeara: '19:00',
        motivOre: '',
        emojiTema: '🙏 ❤️ ✝️ 📖 🕊️',
        sfatImagine: '',
        platform,
        aiGenerated: false,
        parseError: true
      };
    }
  }

  async testConnection() {
    try {
      console.log('🧪 Test AI - Groq key:', !!this.groqKey, '| Gemini key:', !!this.geminiKey);
      const result = await this.generate('Spune "Salut! AI funcționează!" în română. Doar salutul.', 50);
      return {
        success: true,
        response: result,
        modelsStatus: this.getModelsStatus(),
        providers: { groq: !!this.groqKey, gemini: !!this.geminiKey }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        modelsStatus: this.getModelsStatus(),
        providers: { groq: !!this.groqKey, gemini: !!this.geminiKey }
      };
    }
  }
}




module.exports = new AIService();