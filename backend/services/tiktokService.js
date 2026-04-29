// backend/services/tiktokService.js
const axios = require('axios');

class TikTokService {
  constructor() {
    this.baseUrl = 'https://open.tiktokapis.com/v2';
    this.clientKey = process.env.TIKTOK_CLIENT_KEY;
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    this.accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  }

  /**
   * Publică o imagine/video pe TikTok
   * NOTĂ: TikTok API este mai restrictiv, necesită video
   * Pentru imagini, vom crea un slideshow video
   */
  async publishPost(caption, mediaPath) {
    try {
      // TikTok Content Posting API
      // Inițiem încărcarea
      const initResponse = await axios.post(
        `${this.baseUrl}/post/publish/inbox/video/init/`,
        {
          post_info: {
            title: caption.substring(0, 150),
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: 0 // Va fi actualizat
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        postId: initResponse.data?.data?.publish_id,
        note: 'TikTok necesită video - implementare completă necesită conversie imagine->video'
      };
    } catch (error) {
      console.error('Eroare publicare TikTok:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        note: 'TikTok API necesită configurare suplimentară'
      };
    }
  }

  /**
   * Verifică statusul contului
   */
  async verifyAccount() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/user/info/`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          },
          params: {
            fields: 'display_name,follower_count,following_count,video_count'
          }
        }
      );
      return { valid: true, data: response.data.data?.user };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new TikTokService();