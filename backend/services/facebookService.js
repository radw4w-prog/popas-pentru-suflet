const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

class FacebookService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.http = axios.create({
      httpsAgent,
      timeout: 60000
    });
  }

  get accessToken() {
    return process.env.FACEBOOK_ACCESS_TOKEN;
  }

  get pageId() {
    return process.env.FACEBOOK_PAGE_ID;
  }

  isConfigured() {
    return !!(
      this.accessToken &&
      this.pageId &&
      this.accessToken.length > 10 &&
      this.pageId.length > 5
    );
  }

  // ═══ EROARE HELPER ═══
  getFbErrorMessage(error) {
    const fbErr = error.response?.data?.error;
    if (!fbErr) return error.message;

    // Token expirat
    if (fbErr.code === 190) {
      return 'TOKEN EXPIRAT! Regenerează token-ul din Graph API Explorer și pune-l în .env';
    }

    // Permisiuni lipsă
    if (fbErr.code === 200) {
      return 'Permisiuni insuficiente. Regenerează token cu pages_manage_posts.';
    }

    return fbErr.message || error.message;
  }

  // ═══ VERIFY TOKEN ═══
  async verifyToken() {
    if (!this.isConfigured()) {
      return { valid: false, error: 'Token sau Page ID lipsă în .env' };
    }

    try {
      const r = await this.http.get(`${this.baseUrl}/${this.pageId}`, {
        params: {
          fields: 'name,fan_count,picture,link',
          access_token: this.accessToken
        }
      });

      return {
        valid: true,
        pageName: r.data.name,
        followers: r.data.fan_count || 0,
        picture: r.data.picture?.data?.url || null,
        link: r.data.link || null
      };
    } catch (error) {
      const msg = this.getFbErrorMessage(error);
      console.error('❌ verifyToken:', msg);
      return { valid: false, error: msg };
    }
  }

  // ═══ POST TEXT ═══
  async postText(message) {
    if (!this.isConfigured()) {
      throw new Error('Facebook nu este configurat!');
    }

    console.log('📘 Postare text...');

    try {
      const r = await this.http.post(
        `${this.baseUrl}/${this.pageId}/feed`,
        null,
        {
          params: {
            message,
            access_token: this.accessToken
          }
        }
      );

      console.log('✅ Text publicat:', r.data.id);
      return {
        success: true,
        postId: r.data.id,
        platform: 'facebook',
        url: `https://facebook.com/${r.data.id}`
      };
    } catch (error) {
      const msg = this.getFbErrorMessage(error);
      console.error('❌ postText:', msg);
      throw new Error(msg);
    }
  }

  // ═══ POST CU IMAGINE LOCALĂ - METODA SIMPLĂ ═══
  // Folosim /photos cu message direct - cea mai stabilă metodă
  async postWithLocalImage(message, imagePath) {
    if (!this.isConfigured()) {
      throw new Error('Facebook nu este configurat!');
    }

    if (!fs.existsSync(imagePath)) {
      console.log('⚠️ Imaginea nu există, postez text...');
      return await this.postText(message);
    }

    const fileSize = fs.statSync(imagePath).size;
    console.log(`📷 Upload imagine: ${imagePath} (${Math.round(fileSize / 1024)} KB)`);

    try {
      const formData = new FormData();
      formData.append('source', fs.createReadStream(imagePath));
      formData.append('message', message);
      formData.append('access_token', this.accessToken);

      const r = await this.http.post(
        `${this.baseUrl}/${this.pageId}/photos`,
        formData,
        {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 120000
        }
      );

      console.log('✅ Imagine + text publicat:', r.data.id);
      return {
        success: true,
        postId: r.data.id,
        platform: 'facebook',
        url: `https://facebook.com/${r.data.id}`
      };
    } catch (error) {
      const msg = this.getFbErrorMessage(error);
      console.error('❌ postWithLocalImage:', msg);
      throw new Error(msg);
    }
  }

  // ═══ POST CU IMAGINE URL ═══
  async postWithImageUrl(message, imageUrl) {
    if (!this.isConfigured()) {
      throw new Error('Facebook nu este configurat!');
    }

    console.log('📷 Postare cu imagine URL:', imageUrl.substring(0, 60));

    // Descarcă imaginea local
    const tempDir = path.join(__dirname, '../uploads/temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const tempFile = path.join(tempDir, `fb_${Date.now()}.jpg`);

    try {
      // Descarcă
      console.log('   Descărcare imagine...');
      const imgResp = await this.http.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      fs.writeFileSync(tempFile, imgResp.data);
      console.log('   Descărcat:', Math.round(imgResp.data.length / 1024), 'KB');

      // Upload
      const result = await this.postWithLocalImage(message, tempFile);

      // Cleanup
      try { fs.unlinkSync(tempFile); } catch (e) {}
      return result;
    } catch (error) {
      // Cleanup
      try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch (e) {}

      // Fallback: încearcă direct cu URL
      console.log('   ⚠️ Descărcare eșuată, încerc URL direct...');
      try {
        const r = await this.http.post(
          `${this.baseUrl}/${this.pageId}/photos`,
          null,
          {
            params: {
              url: imageUrl,
              message,
              access_token: this.accessToken
            }
          }
        );

        console.log('✅ Publicat cu URL direct:', r.data.id);
        return {
          success: true,
          postId: r.data.id,
          platform: 'facebook',
          url: `https://facebook.com/${r.data.id}`
        };
      } catch (urlError) {
        const msg = this.getFbErrorMessage(urlError);
        console.error('❌ postWithImageUrl:', msg);
        throw new Error(msg);
      }
    }
  }

  // ═══ PUBLISH POST - METODA PRINCIPALĂ ═══
  async publishPost(post) {
  const message = [post.content, post.hashtags]
    .filter(Boolean)
    .join('\n\n');

  console.log('\n════════════════════════════════════');
  console.log('📘 FACEBOOK PUBLISH');
  console.log('   Text:', message.substring(0, 100) + '...');
  console.log('   Are imagine base64:', post.imageBase64 ? 'DA' : 'NU');
  console.log('   Imagine path/url:', post.imageUrl ? 'DA' : 'NU');
  console.log('   Token OK:', this.isConfigured() ? 'DA' : 'NU');
  console.log('════════════════════════════════════\n');

  if (!this.isConfigured()) {
    throw new Error('Facebook nu este configurat! Adaugă token în .env');
  }

  try {
    // 1. Prioritate: imageBase64 (perfect pentru programări cross-server)
    if (post.imageBase64 && post.imageBase64.startsWith('data:image')) {
      const tempDir = path.join(__dirname, '../uploads/temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const matches = post.imageBase64.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const data = matches[2];
        const tempFile = path.join(tempDir, `fb_temp_${Date.now()}.${ext}`);

        fs.writeFileSync(tempFile, Buffer.from(data, 'base64'));

        try {
          const result = await this.postWithLocalImage(message, tempFile);
          try { fs.unlinkSync(tempFile); } catch (e) {}
          return result;
        } catch (e) {
          try { fs.unlinkSync(tempFile); } catch (e2) {}
          throw e;
        }
      }
    }

    // 2. Imagine URL
    if (post.imageUrl) {
      if (post.imageUrl.startsWith('http')) {
        return await this.postWithImageUrl(message, post.imageUrl);
      }

      const localPath = path.isAbsolute(post.imageUrl)
        ? post.imageUrl
        : path.join(__dirname, '..', post.imageUrl);

      return await this.postWithLocalImage(message, localPath);
    }

    // 3. Doar text
    return await this.postText(message);
  } catch (error) {
    console.error('❌ publishPost:', error.message);
    throw error;
  }
}

  // ═══ GET PAGES ═══
  async getMyPages(userToken) {
    try {
      const r = await this.http.get(`${this.baseUrl}/me/accounts`, {
        params: { access_token: userToken }
      });
      return r.data.data.map(p => ({
        id: p.id,
        name: p.name,
        accessToken: p.access_token,
        category: p.category
      }));
    } catch (error) {
      throw new Error(this.getFbErrorMessage(error));
    }
  }

  // ═══ DELETE POST ═══
  async deletePost(postId) {
    if (!this.isConfigured()) throw new Error('Facebook neconectat!');
    try {
      await this.http.delete(`${this.baseUrl}/${postId}`, {
        params: { access_token: this.accessToken }
      });
      return { success: true };
    } catch (error) {
      throw new Error(this.getFbErrorMessage(error));
    }
  }

    // ═══ STATS ═══
  async getPostStats(postId) {
    try {
      const r = await this.http.get(`${this.baseUrl}/${postId}`, {
        params: {
          fields: 'likes.summary(true),comments.summary(true),shares',
          access_token: this.accessToken
        }
      });
      return {
        likes: r.data.likes?.summary?.total_count || 0,
        comments: r.data.comments?.summary?.total_count || 0,
        shares: r.data.shares?.count || 0
      };
    } catch (e) {
      return { likes: 0, comments: 0, shares: 0 };
    }
  }

  // ═══ ANALYTICS POSTARE ═══
  async getPostAnalytics(postId) {
    try {
      const r = await this.http.get(`${this.baseUrl}/${postId}`, {
        params: {
          fields: [
            'message',
            'created_time',
            'likes.summary(true)',
            'comments.summary(true)',
            'shares',
            'reactions.summary(true)',
            'insights.metric(post_impressions,post_reach,post_engaged_users,post_clicks)'
          ].join(','),
          access_token: this.accessToken
        }
      });

      const data = r.data;
      const insights = {};

      if (data.insights?.data) {
        data.insights.data.forEach(metric => {
          insights[metric.name] = metric.values?.[0]?.value || 0;
        });
      }

      return {
        postId,
        message: data.message?.substring(0, 100) || '',
        createdTime: data.created_time,
        likes: data.likes?.summary?.total_count || 0,
        comments: data.comments?.summary?.total_count || 0,
        shares: data.shares?.count || 0,
        reactions: data.reactions?.summary?.total_count || 0,
        impressions: insights.post_impressions || 0,
        reach: insights.post_reach || 0,
        engagedUsers: insights.post_engaged_users || 0,
        clicks: insights.post_clicks || 0,
        engagementRate: insights.post_reach > 0
          ? ((insights.post_engaged_users / insights.post_reach) * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      console.error('Eroare getPostAnalytics:', error.message);
      return null;
    }
  }

  // ═══ ANALYTICS PAGINĂ ═══
   async getPageAnalytics(period = 'week') {
  try {
    // ─── Info pagină ───
    const pageInfo = await this.http.get(
      `${this.baseUrl}/${this.pageId}`,
      {
        params: {
          fields: 'name,fan_count,followers_count,picture,talking_about_count',
          access_token: this.accessToken
        }
      }
    );

    const baseData = {
      pageName: pageInfo.data.name,
      fans: pageInfo.data.fan_count || 0,
      followers: pageInfo.data.followers_count || 0,
      talkingAbout: pageInfo.data.talking_about_count || 0,
      picture: pageInfo.data.picture?.data?.url || null,
      period,
      impressions: 0,
      reach: 0,
      engagedUsers: 0,
      engagements: 0,
      newFans: 0,
      pageViews: 0,
      insightsLimitate: false
    };

    const periodApi = period === 'day'
  ? 'day'
  : period === 'week'
    ? 'week'
    : 'days_28';

    // Metrici care funcționează pentru pagina ta
    const metrici = [
  { api: 'page_views_total', local: 'pageViews', period: periodApi },
  { api: 'page_impressions_unique', local: 'reach', period: periodApi },
  { api: 'page_post_engagements', local: 'engagements', period: periodApi },
  { api: 'page_fan_adds_by_paid_non_paid_unique', local: 'newFans', period: periodApi },
  { api: 'page_daily_follows', local: 'newFans', period: 'day' }
];
    let anySuccess = false;

    // helper: normalizează value (number sau object)
    const normalizeMetricValue = (value) => {
      if (typeof value === 'number') return value;

      if (value && typeof value === 'object') {
        return Object.values(value).reduce((sum, v) => {
          if (typeof v === 'number') return sum + v;
          return sum;
        }, 0);
      }

      return 0;
    };

    for (const metric of metrici) {
      try {
        const r = await this.http.get(
          `${this.baseUrl}/${this.pageId}/insights`,
          {
            params: {
              metric: metric.api,
              period: metric.period,
              access_token: this.accessToken
            }
          }
        );

        if (r.data?.data?.length > 0) {
          const values = r.data.data[0]?.values || [];

          const total = values.reduce((sum, entry) => {
            return sum + normalizeMetricValue(entry.value);
          }, 0);

          // dacă metricile pentru newFans vin din mai multe endpoint-uri,
          // păstrăm valoarea maximă, nu adunăm dublu
          if (metric.local === 'newFans') {
            baseData.newFans = Math.max(baseData.newFans, total);
          } else {
            baseData[metric.local] = total;
          }

          anySuccess = true;
          console.log(`✅ ${metric.api}: ${total}`);
        }
      } catch (e) {
        console.log(`⚠️ ${metric.api}: ${e.response?.data?.error?.message || e.message}`);
      }
    }

    if (!anySuccess) {
      baseData.insightsLimitate = true;
    }

    return baseData;
  } catch (error) {
    console.error('Eroare getPageAnalytics:', error.message);
    throw new Error(this.getFbErrorMessage(error));
  }
}

  // ═══ POSTS RECENTE CU STATS ═══
    async getRecentPostsWithStats(limit = 10) {
    try {
      const r = await this.http.get(
        `${this.baseUrl}/${this.pageId}/posts`,
        {
          params: {
            fields: [
              'id',
              'message',
              'created_time',
              'full_picture',
              'likes.summary(true)',
              'comments.summary(true)',
              'shares',
              'reactions.summary(true)'
            ].join(','),
            limit,
            access_token: this.accessToken
          }
        }
      );

      const posts = r.data?.data || [];

      return posts.map(post => ({
        postId: post.id,
        message: post.message?.substring(0, 150) || '',
        createdTime: post.created_time,
        picture: post.full_picture || null,
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        shares: post.shares?.count || 0,
        reactions: post.reactions?.summary?.total_count || 0,
        url: `https://facebook.com/${post.id}`
      }));
    } catch (error) {
      console.error('Eroare getRecentPostsWithStats:', error.message);
      // Returnăm array gol în loc de eroare
      return [];
    }
  }

} // ← ÎNCHIDE CLASA

module.exports = new FacebookService();