const axios = require('axios');
const AioError = require('./AioError');

class AioBase {
    constructor(token) {
      this.token = token;
      this.apiUrl = `https://api.telegram.org/bot${token}`;
    }

    async _callApi(method, params) {
      try {
        const response = await axios.post(`${this.apiUrl}/${method}`, params);
        return response.data;
      } catch (error) {
        throw AioError.apiError(method, params, error);
      }
    }
}

module.exports = AioBase;