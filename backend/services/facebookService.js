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
    console.log('   Imagine:', post.imageUrl ? 'DA' : 'NU');
    console.log('   Token OK:', this.isConfigured() ? 'DA' : 'NU');
    console.log('════════════════════════════════════\n');

    // Verifică token înainte de a încerca
    if (!this.isConfigured()) {
      throw new Error('Facebook nu este configurat! Adaugă token în .env');
    }

    try {
      if (post.imageUrl) {
        if (post.imageUrl.startsWith('http')) {
          return await this.postWithImageUrl(message, post.imageUrl);
        }
        const localPath = path.isAbsolute(post.imageUrl)
          ? post.imageUrl
          : path.join(__dirname, '..', post.imageUrl);
        return await this.postWithLocalImage(message, localPath);
      }

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
}

module.exports = new FacebookService();