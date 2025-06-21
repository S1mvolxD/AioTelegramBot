const AioBase = require('./AioBase');
const AioContext = require('./AioContext');
const AioParser = require('./AioParser');

class AioClient extends AioBase {
  constructor(token) {
    super(token);
    this.commands = {};
    this.actions = {
      sendMessage: this.sendMessage.bind(this),
      replyMessage: this.replyMessage.bind(this)
    };
  }

  command({ name, code }) {
    this.commands[name] = code;
  }

  async handleUpdate(update) {
    const context = new AioContext(update);
    const commandName = context.text.split(' ')[0].replace('/', '');
    
    if (this.commands[commandName]) {
      await AioParser.parseBlocks(
        this.commands[commandName],
        context,
        this.actions
      );
    }
  }

  async sendMessage(context, text) {
    return this._callApi('sendMessage', {
      chat_id: context.chatId,
      text
    });
  }

  async replyMessage(context, text) {
    return this._callApi('sendMessage', {
      chat_id: context.chatId,
      text,
      reply_to_message_id: context.messageId
    });
  }

  async startPolling() {
    this.lastUpdateId = 0;
    
    const poll = async () => {
      try {
        const response = await this._callApi('getUpdates', {
          offset: this.lastUpdateId + 1,
          timeout: 30
        });
        
        if (response.ok && response.result) {
          for (const update of response.result) {
            try {
              await this.handleUpdate(update);
            } catch (e) {
              console.error('Update handling error:', e);
            }
            this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);
          }
        }
      } catch (e) {
        console.error('Polling fatal error:', e);
      }
      
      // Рекурсивный вызов вместо setInterval
      setTimeout(poll, 500);
    };
    
    poll();
  }
}

module.exports = AioClient;
