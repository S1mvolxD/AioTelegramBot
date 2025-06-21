// Проверяем наличие глобального fetch (Node.js 18+)
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  try {
    fetch = require('node-fetch');
  } catch (e) {
    console.error("CRITICAL: Failed to load fetch implementation");
    throw e;
  }
}

class AioBase {
  constructor(token) {
    this.token = token;
    this.apiUrl = `https://api.telegram.org/bot${token}`;
    
    // Проверка fetch в конструкторе
    if (typeof fetch !== 'function') {
      throw new Error("Fetch is not initialized!");
    }
  }

  async _callApi(method, params) {
    const url = `${this.apiUrl}/${method}`;
    try {
      console.log("Using fetch implementation:", fetch.name || "node-fetch");
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (e) {
      console.error('API Error:', e);
      return { ok: false, error: e.message };
    }
  }
}

module.exports = AioBase;
