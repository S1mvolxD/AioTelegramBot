const fetch = require('node-fetch');

class AioBase {
  constructor(token) {
    this.token = token;
    this.apiUrl = `https://api.telegram.org/bot${token}`;
  }

  async _callApi(method, params) {
    const url = `${this.apiUrl}/${method}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await response.json();
    } catch (e) {
      console.error('API Error:', e);
      return { ok: false };
    }
  }
}

module.exports = AioBase;
