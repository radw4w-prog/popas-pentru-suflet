const axios = require('axios');
const crypto = require('crypto');

const GRAPH_BASE = 'https://graph.facebook.com/v22.0';

function getFacebookConfig() {
  const appId = process.env.FACEBOOK_LOGIN_APP_ID || process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_LOGIN_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Lipsesc FACEBOOK_LOGIN_APP_ID sau FACEBOOK_LOGIN_APP_SECRET în .env');
  }

  return { appId, appSecret };
}

function getAppSecretProof(accessToken, appSecret) {
  return crypto
    .createHmac('sha256', appSecret)
    .update(accessToken)
    .digest('hex');
}

async function verifyFacebookToken(accessToken, expectedUserId = null) {
  const { appId, appSecret } = getFacebookConfig();

  // 1. Verificăm tokenul prin debug_token
  const debugRes = await axios.get(`${GRAPH_BASE}/debug_token`, {
    params: {
      input_token: accessToken,
      access_token: `${appId}|${appSecret}`
    }
  });

  const tokenData = debugRes.data?.data;

  if (!tokenData || !tokenData.is_valid) {
    throw new Error('Token Facebook invalid.');
  }

  if (String(tokenData.app_id) !== String(appId)) {
    throw new Error('Tokenul nu aparține aplicației Facebook de login.');
  }

  if (expectedUserId && String(tokenData.user_id) !== String(expectedUserId)) {
    throw new Error('User ID Facebook nu corespunde tokenului.');
  }

  // 2. Luăm profilul minim
  const appsecret_proof = getAppSecretProof(accessToken, appSecret);

  const meRes = await axios.get(`${GRAPH_BASE}/me`, {
    params: {
      fields: 'id,name,email,picture.type(large)',
      access_token: accessToken,
      appsecret_proof
    }
  });

  const profile = meRes.data;

  if (!profile?.id) {
    throw new Error('Nu am putut obține profilul Facebook.');
  }

  return {
    facebookId: profile.id,
    nume: profile.name || 'Utilizator Facebook',
    email: profile.email ? profile.email.toLowerCase() : null,
    avatar: profile.picture?.data?.url || null
  };
}

module.exports = {
  verifyFacebookToken
};