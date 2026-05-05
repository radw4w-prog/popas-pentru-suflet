const axios = require('axios');

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
const MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-001',
  'gemma-3-12b-it',
  'gemma-3-4b-it'
];

class GeminiService {
  constructor() {
    this.http = axios.create({ timeout: 60000 });
    this.lastRequestTime = 0;
    this.MIN_INTERVAL = 4000; // 4 secunde între request-uri
  }

  get apiKey() {
    return process.env.GEMINI_API_KEY;
  }

  isConfigured() {
    return !!(this.apiKey && this.apiKey.length > 10);
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
    throw new Error('Gemini API key lipsă.');
  }

  await this.waitForRateLimit();

  const MODELS = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-001',
    'gemma-3-12b-it',
    'gemma-3-4b-it'
  ];

  for (const model of MODELS) {
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
        }
      );

      const text = r.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      console.log(`✅ Succes cu modelul: ${model}`);
      return text.trim();

    } catch (error) {
      const status = error.response?.status;
      const msg = error.response?.data?.error?.message || error.message;

      if (status === 429) {
        console.log(`⚠️ Rate limit pe ${model}, încerc următorul...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      console.log(`⚠️ Eroare pe ${model}: ${msg}`);
      continue;
    }
  }

  throw new Error('Toate modelele AI au atins limita. Încearcă din nou în câteva minute.');
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
        style: 'emoțional, scurt, vizual, inspirațional, cu emoji-uri, primele 2 rânduri trebuie să capteze atenția',
        hashtagCount: '20-25',
        cta: 'exemple: Salvează pentru momente grele, Trimite unui prieten care are nevoie'
      },
      tiktok: {
        name: 'TikTok',
        maxLen: 180,
        style: 'hook puternic în prima propoziție, scurt, direct, trending, pentru audiență tânără',
        hashtagCount: '5-8',
        cta: 'exemple: Follow pentru verset zilnic, Like dacă crezi în puterea rugăciunii'
      }
    };

    const p = platformGuide[platform] || platformGuide.facebook;

    const prompt = `Ești un creator de conținut creștin expert, specializat pe ${p.name} în România.
Misiunea ta: să creezi conținut autentic, cald și inspirațional care să miște inimile oamenilor.

VERSET BIBLIC: "${verset}"
REFERINȚĂ: ${referinta}
TEMA: ${tema}
PLATFORMĂ: ${p.name}

CONTEXT IMPORTANT:
- Audiența: creștini români de toate vârstele
- Tonul: autentic, cald, nu predicator
- Stilul ${p.name}: ${p.style}
- Ora optimă: românii postează de 2 ori pe zi (dimineața și seara)

Generează EXCLUSIV un JSON valid cu această structură exactă:
{
  "hook": "Prima propoziție care oprește scrolling-ul. Max 15 cuvinte. Poate fi o întrebare, o afirmație surprinzătoare sau un citat puternic.",
  "descriere": "Textul complet al postării. Stilul: ${p.style}. Max ${p.maxLen} caractere. Include versetul cu ghilimele și referința. Finalul să aibă CTA.",
  "cta": "Call to action specific ${p.name}. O propoziție. ${p.cta}",
  "hashtags_principale": ["5 hashtag-uri mari în română, fără simbolul #, cu reach mare"],
  "hashtags_nisa": ["8 hashtag-uri de nișă creștină în română, fără #"],
  "hashtags_brand": ["PopasPentruSuflet", "VersetulZilei", "BibliaCornilescu"],
  "story_text": "Text pentru Story/Reel overlay. Max 6 cuvinte. Impact maxim.",
  "varianta_calda": "Versiune alternativă cu ton personal și intim. Max ${p.maxLen} caractere. Include versetul.",
  "varianta_puternica": "Versiune alternativă cu ton inspirațional și puternic. Max ${p.maxLen} caractere. Include versetul.",
  "ora_recomandata_dimineata": "Ora optimă dimineața pentru ${p.name} în România (format HH:MM, între 06:00-09:00)",
  "ora_recomandata_seara": "Ora optimă seara pentru ${p.name} în România (format HH:MM, între 18:00-22:00)",
  "motiv_ore": "De ce aceste ore sunt optime pentru audiența creștină din România (max 20 cuvinte)",
  "emoji_tema": "6-8 emoji-uri relevante pentru tema '${tema}', separate prin spațiu",
  "sfat_imagine": "Sugestie scurtă pentru imaginea care ar merge cu această postare (max 15 cuvinte)"
}

REGULI STRICTE:
1. Scrie EXCLUSIV în română
2. Returnează DOAR JSON valid, fără text înainte sau după
3. Fără \\n în interiorul string-urilor JSON (folosește spațiu)
4. Hashtag-urile FĂRĂ simbolul #
5. Fii autentic, nu predicator sau artificial
6. Hook-ul trebuie să fie irezistibil
7. Include versetul natural în descriere, nu forțat`;

    const raw = await this.generate(prompt, 3000);

    try {
      let jsonStr = raw;

      // Extrage JSON din markdown code blocks
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      } else {
        // Găsește primul { și ultimul }
        const firstBrace = raw.indexOf('{');
        const lastBrace = raw.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = raw.substring(firstBrace, lastBrace + 1);
        }
      }

      // Curăță newline-uri problematice din JSON
      jsonStr = jsonStr.replace(/\n/g, ' ').replace(/\r/g, '');

      const parsed = JSON.parse(jsonStr);

      // Construiește hashtags complet
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
        emojiTema: parsed.emoji_tema || '',
        sfatImagine: parsed.sfat_imagine || '',
        platform,
        aiGenerated: true,
        parseError: false
      };

    } catch (parseError) {
      console.error('❌ Parse JSON error:', parseError.message);
      console.error('Raw (first 300):', raw.substring(0, 300));

      return {
        hook: '',
        descriere: raw.substring(0, 500),
        cta: '',
        hashtags: '#PopasPentruSuflet #VersetulZilei #Biblia #Credinta #Dumnezeu #Isus #Rugaciune',
        hashtagsPrincipale: [],
        hashtagsNisa: [],
        hashtagsBrand: ['PopasPentruSuflet'],
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

  async testConnection() {
    try {
      const result = await this.generate('Spune "Salut!" în română. Răspunde doar cu salutul.', 50);
      return { success: true, response: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new GeminiService();