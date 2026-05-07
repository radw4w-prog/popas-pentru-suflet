// backend/utils/spiritualJourneyService.js
const SpiritualJourney = require('../models/SpiritualJourney');

// ═══════════════════════════════════════
// BADGE-URI DEFINITE
// ═══════════════════════════════════════
const BADGES = [
  // Statornicie
  { id: 'streak_1',   nume: 'Primii pași',              descriere: 'Prima zi activă',                     icon: '🌱', categorie: 'statornicie', conditie: p => p.streakCurent >= 1   },
  { id: 'streak_3',   nume: '3 zile de statornicie',    descriere: '3 zile consecutive active',           icon: '🕯️', categorie: 'statornicie', conditie: p => p.streakMaxim >= 3    },
  { id: 'streak_7',   nume: 'O săptămână cu Domnul',    descriere: '7 zile consecutive active',           icon: '🔥', categorie: 'statornicie', conditie: p => p.streakMaxim >= 7    },
  { id: 'streak_30',  nume: 'O lună de statornicie',    descriere: '30 de zile consecutive active',       icon: '⛪', categorie: 'statornicie', conditie: p => p.streakMaxim >= 30   },
  { id: 'streak_100', nume: 'Umblare credincioasă',     descriere: '100 de zile consecutive active',      icon: '👑', categorie: 'statornicie', conditie: p => p.streakMaxim >= 100  },

  // Biblie
  { id: 'citit_10',   nume: 'Iubitor de Cuvânt',        descriere: '10 capitole citite',                  icon: '📖', categorie: 'biblie',      conditie: p => p.stats.capitoleCitite >= 10   },
  { id: 'citit_50',   nume: 'Cercetător al Scripturii', descriere: '50 de capitole citite',               icon: '📜', categorie: 'biblie',      conditie: p => p.stats.capitoleCitite >= 50   },
  { id: 'citit_100',  nume: 'Hrănit din Cuvânt',        descriere: '100 de capitole citite',              icon: '✨', categorie: 'biblie',      conditie: p => p.stats.capitoleCitite >= 100  },
  { id: 'citit_500',  nume: 'Împătimit de Scriptură',   descriere: '500 de capitole citite',              icon: '🏛️', categorie: 'biblie',      conditie: p => p.stats.capitoleCitite >= 500  },

  // Audio
  { id: 'audio_10',   nume: 'Ascultător credincios',    descriere: '10 capitole ascultate',               icon: '🎧', categorie: 'audio',       conditie: p => p.stats.capitoleAscultate >= 10  },
  { id: 'audio_50',   nume: 'Ureche atentă',            descriere: '50 de capitole ascultate',            icon: '🔊', categorie: 'audio',       conditie: p => p.stats.capitoleAscultate >= 50  },
  { id: 'audio_150',  nume: 'Inimă deschisă',           descriere: '150 de capitole ascultate',           icon: '💫', categorie: 'audio',       conditie: p => p.stats.capitoleAscultate >= 150 },

  // Devoțional
  { id: 'devot_7',    nume: 'Dimineață cu Domnul',      descriere: '7 devoționale parcurse',              icon: '🌅', categorie: 'devotional',  conditie: p => p.stats.devotionaleParcurse >= 7  },
  { id: 'devot_30',   nume: 'Ritm de har',              descriere: '30 de devoționale parcurse',          icon: '☀️', categorie: 'devotional',  conditie: p => p.stats.devotionaleParcurse >= 30 },

  // Rugăciune
  { id: 'rug_10',     nume: 'Inimă de rugăciune',       descriere: '10 interacțiuni cu rugăciunea',       icon: '🙏', categorie: 'rugaciune',   conditie: p => p.stats.rugaciuniInteractionate >= 10 },
  { id: 'rug_25',     nume: 'Sprijin pentru alții',     descriere: '25 de rugăciuni pentru alții',        icon: '🤝', categorie: 'rugaciune',   conditie: p => p.stats.rugaciuniInteractionate >= 25 },
];

// ═══════════════════════════════════════
// NIVELURI
// ═══════════════════════════════════════
const NIVELURI = [
  { id: 'samanta',    label: 'Sămânță',               icon: '🌱', puncteMin: 0    },
  { id: 'rasarire',   label: 'Răsărire',              icon: '🌿', puncteMin: 50   },
  { id: 'crestere',   label: 'Creștere',              icon: '🌾', puncteMin: 150  },
  { id: 'rodire',     label: 'Rodire',                icon: '🍇', puncteMin: 350  },
  { id: 'statornicie',label: 'Statornicie',           icon: '🕊️', puncteMin: 700  },
  { id: 'umblare',    label: 'Umblare credincioasă',  icon: '✨', puncteMin: 1200 },
];

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
const getSaptamanaKey = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
};

const getZiKey = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

const isYesterday = (date) => {
  if (!date) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

const calculeazaNivel = (puncte) => {
  let nivel = NIVELURI[0];
  for (const n of NIVELURI) {
    if (puncte >= n.puncteMin) nivel = n;
  }
  return nivel;
};

const calculeazaPuncte = (stats, streakMaxim, totalZileActive) => {
  return (
    stats.capitoleCitite * 3 +
    stats.capitoleAscultate * 3 +
    stats.devotionaleParcurse * 5 +
    stats.rugaciuniInteractionate * 2 +
    streakMaxim * 10 +
    totalZileActive * 2
  );
};

// ═══════════════════════════════════════
// RECALCULEAZĂ BADGE-URI
// ═══════════════════════════════════════
const recalculateBadges = (profil) => {
  const badgesExistente = new Set(profil.badgesDeblocate.map(b => b.id));
  const badgesNoi = [];

  for (const badge of BADGES) {
    if (!badgesExistente.has(badge.id) && badge.conditie(profil)) {
      badgesNoi.push({
        id: badge.id,
        nume: badge.nume,
        descriere: badge.descriere,
        icon: badge.icon,
        categorie: badge.categorie,
        deblocatLa: new Date()
      });
    }
  }

  return badgesNoi;
};

// ═══════════════════════════════════════
// MARK DAILY ACTIVITY — funcția principală
// ═══════════════════════════════════════
const markDailyActivity = async (userId, sursa = 'general', statsIncrement = {}) => {
  try {
    let profil = await SpiritualJourney.findOne({ userId });

    if (!profil) {
      profil = await SpiritualJourney.create({ userId });
    }

    const azi = new Date();
    const sapt = getSaptamanaKey(azi);

    // ── Actualizează streak ──
    const eraActiv = isSameDay(profil.ultimaZiActiva, azi);

    if (!eraActiv) {
      const eraIeri = isYesterday(profil.ultimaZiActiva);

      if (eraIeri) {
        // Continuă streak-ul
        profil.streakCurent += 1;
      } else if (!profil.ultimaZiActiva) {
        // Prima zi
        profil.streakCurent = 1;
      } else {
        // Streak rupt
        profil.streakCurent = 1;
      }

      profil.ultimaZiActiva = azi;
      profil.totalZileActive += 1;

      // Actualizează streak maxim
      if (profil.streakCurent > profil.streakMaxim) {
        profil.streakMaxim = profil.streakCurent;

        // Salvează milestone
        profil.milestoneHistory.push({
          tip: 'streak_maxim',
          valoare: profil.streakMaxim,
          data: azi
        });
      }

      // ── Obiectiv săptămânal ──
      if (profil.saptamanaTrackingKey !== sapt) {
        profil.saptamanaTrackingKey = sapt;
        profil.zileSaptamanaAceasta = 1;
      } else {
        profil.zileSaptamanaAceasta += 1;
      }
    }

    // ── Actualizează statistici ──
    if (statsIncrement.capitoleCitite) {
      profil.stats.capitoleCitite += statsIncrement.capitoleCitite;
    }
    if (statsIncrement.capitoleAscultate) {
      profil.stats.capitoleAscultate += statsIncrement.capitoleAscultate;
    }
    if (statsIncrement.devotionaleParcurse) {
      profil.stats.devotionaleParcurse += statsIncrement.devotionaleParcurse;
    }
    if (statsIncrement.rugaciuniInteractionate) {
      profil.stats.rugaciuniInteractionate += statsIncrement.rugaciuniInteractionate;
    }

    // ── Recalculează puncte și nivel ──
    profil.puncteTotal = calculeazaPuncte(
      profil.stats,
      profil.streakMaxim,
      profil.totalZileActive
    );

    const nivelNou = calculeazaNivel(profil.puncteTotal);
    profil.nivel = nivelNou.id;

    // ── Verifică badge-uri noi ──
    const badgesNoi = recalculateBadges(profil);
    if (badgesNoi.length > 0) {
      profil.badgesDeblocate.push(...badgesNoi);
    }

    await profil.save();

    return {
      success: true,
      profil,
      badgesNoi,
      nivelNou: nivelNou
    };

  } catch (error) {
    console.error('❌ spiritualJourneyService error:', error.message);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════
// GET PROFIL COMPLET
// ═══════════════════════════════════════
const getProfilComplet = async (userId) => {
  try {
    let profil = await SpiritualJourney.findOne({ userId });

    if (!profil) {
      profil = await SpiritualJourney.create({ userId });
    }

    const nivelInfo = calculeazaNivel(profil.puncteTotal);
    const nivelUrmator = NIVELURI[NIVELURI.indexOf(nivelInfo) + 1] || null;

    // Calculează progres spre nivelul următor
    let procentSpреNivelUrmator = 100;
    if (nivelUrmator) {
      const range = nivelUrmator.puncteMin - nivelInfo.puncteMin;
      const progress = profil.puncteTotal - nivelInfo.puncteMin;
      procentSpреNivelUrmator = Math.min(100, Math.round((progress / range) * 100));
    }

    // Obiectiv săptămânal
    const sapt = getSaptamanaKey();
    if (profil.saptamanaTrackingKey !== sapt) {
      profil.zileSaptamanaAceasta = 0;
    }

    // Toate badge-urile cu status
    const badgesAll = BADGES.map(b => ({
      ...b,
      deblocat: profil.badgesDeblocate.some(bd => bd.id === b.id),
      deblocatLa: profil.badgesDeblocate.find(bd => bd.id === b.id)?.deblocatLa || null,
      conditie: undefined
    }));

    return {
      success: true,
      streak: {
        curent: profil.streakCurent,
        maxim: profil.streakMaxim,
        ultimaZiActiva: profil.ultimaZiActiva
      },
      nivel: {
        id: nivelInfo.id,
        label: nivelInfo.label,
        icon: nivelInfo.icon,
        puncte: profil.puncteTotal,
        procentSpреNivelUrmator,
        nivelUrmator: nivelUrmator ? {
          label: nivelUrmator.label,
          icon: nivelUrmator.icon,
          puncteNecesare: nivelUrmator.puncteMin
        } : null
      },
      saptamana: {
        zileActive: profil.zileSaptamanaAceasta,
        obiectiv: profil.obiectivSaptamanal,
        procent: Math.round((profil.zileSaptamanaAceasta / profil.obiectivSaptamanal) * 100)
      },
      stats: profil.stats,
      totalZileActive: profil.totalZileActive,
      badges: {
        deblocate: profil.badgesDeblocate,
        toate: badgesAll,
        total: profil.badgesDeblocate.length,
        disponibile: BADGES.length
      }
    };

  } catch (error) {
    console.error('❌ getProfilComplet error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  markDailyActivity,
  getProfilComplet,
  BADGES,
  NIVELURI
};