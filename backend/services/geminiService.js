// E:\popas-pentru-suflet\backend\services\geminiService.js
const axios = require('axios');

// ✅ MODELE ORDONATE: cele care funcționează PRIMELE
const MODELS = [
  'gemma-3-12b-it',    // ✅ FUNCȚIONEAZĂ - primul!
  'gemma-3-4b-it',     // ✅ FUNCȚIONEAZĂ - backup
  'gemini-2.0-flash-lite',  // poate reveni după reset quota
  'gemini-2.0-flash-001',   // poate reveni după reset quota
];

class GeminiService {
  constructor() {
    this.http = axios.create({ timeout: 60000 });
    this.lastRequestTime = 0;
    this.MIN_INTERVAL = 3000; // 3 secunde între request-uri
    
    // Cache modele care au quota epuizată (resetat la restart)
    this.exhaustedModels = new Map(); // model -> timestamp când s-a epuizat
    this.EXHAUSTED_COOLDOWN = 60 * 60 * 1000; // 1 oră cooldown
  }

  get apiKey() {
    return process.env.GEMINI_API_KEY?.trim();
  }

  isConfigured() {
    return !!(this.apiKey && this.apiKey.length > 10);
  }

  // Verifică dacă modelul e în cooldown
  isModelExhausted(model) {
    if (!this.exhaustedModels.has(model)) return false;
    const exhaustedAt = this.exhaustedModels.get(model);
    const elapsed = Date.now() - exhaustedAt;
    if (elapsed > this.EXHAUSTED_COOLDOWN) {
      this.exhaustedModels.delete(model); // Reset după cooldown
      return false;
    }
    return true;
  }

  markModelExhausted(model) {
    this.exhaustedModels.set(model, Date.now());
    console.log(`🚫 Model ${model} marcat ca epuizat pentru 1 oră`);
  }

  async waitForRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.MIN_INTERVAL) {
      const wait = this.MIN_INTERVAL - elapsed;
      console.log(`⏳ Rate limit wait: ${wait}ms`);
      await new Promise(r => setTimeout(r, wait));
    }
    this.lastRequestTime = Date.now();
  }

  async generate(prompt, maxTokens = 2000) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key lipsă. Adaugă GEMINI_API_KEY în .env');
    }

    await this.waitForRateLimit();

    // Filtrează modelele disponibile (exclude cele epuizate)
    const availableModels = MODELS.filter(m => !this.isModelExhausted(m));
    
    if (availableModels.length === 0) {
      throw new Error('Toate modelele AI sunt temporar indisponibile. Încearcă în 1 oră.');
    }

    let lastError = null;

    for (const model of availableModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      console.log(`🤖 Încerc modelul: ${model}`);

      try {
        const r = await this.http.post(
          `${url}?key=${this.apiKey}`,
          {
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: maxTokens,
              topP: 0.92,
              topK: 40
            }
          },
          { timeout: 60000 }
        );

        const text = r.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          console.log(`⚠️ ${model}: răspuns gol, încerc următorul`);
          continue;
        }

        console.log(`✅ Succes cu modelul: ${model}`);
        return text.trim();

      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.error?.message || error.message;

        if (status === 429) {
          // Quota epuizată - marchează modelul și continuă
          console.log(`🚫 Quota epuizată pe ${model}`);
          this.markModelExhausted(model);
          lastError = new Error(`Quota epuizată pe ${model}`);
          continue;
        }

        if (status === 404) {
          // Model inexistent - elimină permanent din sesiune
          console.log(`❌ Model inexistent: ${model}`);
          this.markModelExhausted(model);
          lastError = new Error(`Model inexistent: ${model}`);
          continue;
        }

        if (status === 400) {
          // Bad request - log detalii pentru debug
          console.log(`❌ Bad request pe ${model}: ${msg}`);
          lastError = new Error(`Bad request: ${msg}`);
          continue;
        }

        if (status === 401 || status === 403) {
          throw new Error('API Key Gemini invalid sau expirat!');
        }

        console.log(`⚠️ Eroare pe ${model} [${status}]: ${msg}`);
        lastError = error;
        continue;
      }
    }

    // Toate modelele au eșuat
    const exhaustedCount = MODELS.length - availableModels.length;
    if (exhaustedCount > 0) {
      throw new Error(`Quota AI epuizată temporar (${exhaustedCount} modele indisponibile). Încearcă în câteva minute.`);
    }
    
    throw lastError || new Error('Toate modelele AI au eșuat. Încearcă din nou.');
  }

  async generatePostContent(verset, referinta, tema, platform) {
    const platformGuide = {
      facebook: {
        name: 'Facebook',
        maxLen: 500,
        style: 'storytelling, personal, cald, cu o întrebare la final care invită la comentarii',
        hashtagCount: '8-12',
        cta: 'exemple: Lasă un ❤️ dacă te-a atins, Distribuie cuiva drag, Ce înseamnă pentru tine?'
      },
      instagram: {
        name: 'Instagram',
        maxLen: 350,
        style: 'emoțional, scurt, vizual, inspirațional, cu emoji-uri, primele 2 rânduri captează atenția',
        hashtagCount: '20-25',
        cta: 'exemple: Salvează pentru momente grele, Trimite unui prieten care are nevoie'
      },
      tiktok: {
        name: 'TikTok',
        maxLen: 180,
        style: 'hook puternic în prima propoziție, scurt, direct, pentru audiență tânără',
        hashtagCount: '5-8',
        cta: 'exemple: Follow pentru verset zilnic, Like dacă crezi în puterea rugăciunii'
      }
    };

    const p = platformGuide[platform] || platformGuide.facebook;

    // ✅ Prompt optimizat pentru gemma (mai simplu = mai fiabil)
    const prompt = `Ești un creator de conținut creștin expert pentru ${p.name} în România.

VERSET: "${verset}"
REFERINȚĂ: ${referinta}
TEMA: ${tema}

Creează o postare creștină autentică și caldă pentru audiența română.

Returnează DOAR un JSON valid cu această structură:
{
  "hook": "Prima propoziție captivantă, max 15 cuvinte, cu emoji",
  "descriere": "Textul postării, stil ${p.style}, max ${p.maxLen} caractere, include versetul natural",
  "cta": "Call to action specific, o propoziție",
  "hashtags_principale": ["credinta", "rugaciune", "dumnezeu", "isus", "biblie"],
  "hashtags_nisa": ["versetulzilei", "crestin", "evanghelie", "hristos", "mantuire", "har", "iubire", "pace"],
  "hashtags_brand": ["PopasPentruSuflet", "VersetulZilei", "BibliaCornilescu"],
  "story_text": "Max 6 cuvinte impactante pentru Story",
  "varianta_calda": "Versiune intimă și personală, max ${p.maxLen} caractere",
  "varianta_puternica": "Versiune inspirațională puternică, max ${p.maxLen} caractere",
  "ora_recomandata_dimineata": "07:00",
  "ora_recomandata_seara": "19:00",
  "motiv_ore": "Ore cu engagement maxim pentru creștinii din România",
  "emoji_tema": "🙏 ❤️ ✝️ 📖 🕊️",
  "sfat_imagine": "Sugestie scurtă pentru imagine, max 15 cuvinte"
}

REGULI: Doar română, doar JSON valid, fără text înainte/după, hashtag-urile fără simbolul #`;

    const raw = await this.generate(prompt, 2500);

    try {
      let jsonStr = raw;

      // Extrage JSON din markdown code blocks
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      } else {
        const firstBrace = raw.indexOf('{');
        const lastBrace = raw.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = raw.substring(firstBrace, lastBrace + 1);
        }
      }

      // Curăță newline-uri din interiorul JSON
      jsonStr = jsonStr.replace(/\n/g, ' ').replace(/\r/g, '');

      const parsed = JSON.parse(jsonStr);

      // Construiește hashtags
      const allHashtags = [
        ...(parsed.hashtags_principale || []).map(h => '#' + h.replace(/^#/, '').trim()),
        ...(parsed.hashtags_nisa || []).map(h => '#' + h.replace(/^#/, '').trim()),
        ...(parsed.hashtags_brand || []).map(h => '#' + h.replace(/^#/, '').trim())
      ].filter(Boolean);

      const uniqueHashtags = [...new Set(allHashtags)];

      return {
        hook: parsed.hook || '',
        descriere: parsed.descriere || '',
        cta: parsed.cta || '',
        hashtags: uniqueHashtags.join(' '),
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
      console.error('Raw (first 500):', raw.substring(0, 500));

      // Fallback cu date parțiale
      return {
        hook: '',
        descriere: raw.substring(0, 500),
        cta: '',
        hashtags: '#PopasPentruSuflet #VersetulZilei #Biblia #Credinta #Dumnezeu #Isus #Rugaciune',
        hashtagsPrincipale: ['credinta', 'rugaciune', 'dumnezeu'],
        hashtagsNisa: ['versetulzilei', 'crestin', 'evanghelie'],
        hashtagsBrand: ['PopasPentruSuflet', 'VersetulZilei'],
        storyText: '',
        variantaCalda: '',
        variantaPuternica: '',
        oraDimineata: '07:00',
        oraSeara: '19:00',
        motivOre: 'Ore cu engagement ridicat pentru audiența creștină din România',
        emojiTema: '🙏 ❤️ ✝️ 📖 🕊️',
        sfatImagine: '',
        platform,
        aiGenerated: false,
        parseError: true
      };
    }
  }

  // Status modele - pentru debug/monitoring
  getModelsStatus() {
    return MODELS.map(model => ({
      model,
      status: this.isModelExhausted(model) ? 'exhausted' : 'available',
      exhaustedAt: this.exhaustedModels.get(model) 
        ? new Date(this.exhaustedModels.get(model)).toISOString() 
        : null
    }));
  }

  async testConnection() {
    try {
      const result = await this.generate(
        'Spune "Salut! Gemini funcționează!" în română. Răspunde DOAR cu salutul.', 
        50
      );
      return { 
        success: true, 
        response: result,
        modelsStatus: this.getModelsStatus()
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        modelsStatus: this.getModelsStatus()
      };
    }
  }
}

module.exports = new GeminiService();