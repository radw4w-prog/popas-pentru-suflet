// backend/services/instagramService.js
const axios = require('axios');

class InstagramService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    this.accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN; // Se folosește același token
  }

  /**
   * Publică o imagine pe Instagram
   * Instagram API necesită URL public pentru imagine
   */
  async publishImagePost(caption, imageUrl) {
    try {
      // Pasul 1: Creăm container-ul media
      const containerResponse = await axios.post(
        `${this.baseUrl}/${this.accountId}/media`,
        {
          image_url: imageUrl, // Trebuie să fie URL public
          caption: caption,
          access_token: this.accessToken
        }
      );

      const containerId = containerResponse.data.id;

      // Pasul 2: Publicăm container-ul
      // Așteptăm puțin pentru procesare
      await new Promise(resolve => setTimeout(resolve, 5000));

      const publishResponse = await axios.post(
        `${this.baseUrl}/${this.accountId}/media_publish`,
        {
          creation_id: containerId,
          access_token: this.accessToken
        }
      );

      return {
        success: true,
        postId: publishResponse.data.id,
        postUrl: `https://www.instagram.com/p/${publishResponse.data.id}/`
      };
    } catch (error) {
      console.error('Eroare publicare Instagram:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Publică un carusel pe Instagram
   */
  async publishCarouselPost(caption, imageUrls) {
    try {
      // Creăm containere pentru fiecare imagine
      const containerIds = [];
      
      for (const imageUrl of imageUrls) {
        const response = await axios.post(
          `${this.baseUrl}/${this.accountId}/media`,
          {
            image_url: imageUrl,
            is_carousel_item: true,
            access_token: this.accessToken
          }
        );
        containerIds.push(response.data.id);
      }

      // Creăm carousel container
      const carouselResponse = await axios.post(
        `${this.baseUrl}/${this.accountId}/media`,
        {
          caption: caption,
          media_type: 'CAROUSEL',
          children: containerIds.join(','),
          access_token: this.accessToken
        }
      );

      // Publicăm
      await new Promise(resolve => setTimeout(resolve, 5000));

      const publishResponse = await axios.post(
        `${this.baseUrl}/${this.accountId}/media_publish`,
        {
          creation_id: carouselResponse.data.id,
          access_token: this.accessToken
        }
      );

      return {
        success: true,
        postId: publishResponse.data.id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifică statusul contului
   */
  async verifyAccount() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.accountId}`,
        {
          params: {
            fields: 'username,name,followers_count,media_count',
            access_token: this.accessToken
          }
        }
      );
      return { valid: true, data: response.data };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new InstagramService();