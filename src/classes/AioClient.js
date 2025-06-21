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
    
    setInterval(async () => {
      try {
        const response = await this._callApi('getUpdates', {
          offset: this.lastUpdateId + 1,
          timeout: 30
        });
        
        if (response.ok && response.result.length > 0) {
          for (const update of response.result) {
            await this.handleUpdate(update);
            this.lastUpdateId = update.update_id;
          }
        }
      } catch (e) {
        console.error('Polling Error:', e);
      }
    }, 1000);
  }
}

module.exports = AioClient;