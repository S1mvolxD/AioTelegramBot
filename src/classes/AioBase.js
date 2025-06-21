const axios = require('axios');

class AioBase {
  constructor(token) {
    this.token = token;
    this.apiUrl = `https://api.telegram.org/bot${token}`;
  }

  async _callApi(method, params) {
    try {
      const response = await axios.post(`${this.apiUrl}/${method}`, params);
      return response.data;
    } catch (e) {
      console.error('API Error:', e.response?.data || e.message);
      return { ok: false };
    }
  }
}

module.exports = AioBase;
