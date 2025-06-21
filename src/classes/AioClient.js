const AioError = require('./AioError');
const AioBase = require('./AioBase');
const AioContext = require('./AioContext');
const AioParser = require('./AioParser');
const LoadCommands = require('./LoadCommands');

class AioClient extends AioBase {
  constructor(token) {
    super(token);
    this.commands = {};
    this.actions = {
      sendMessage: this.sendMessage.bind(this),
      replyMessage: this.replyMessage.bind(this)
    };
    this.lastUpdateId = 0; // Инициализация для polling
    this.loader = new LoadCommands(this);
  }

  loadCommands(directory) {
    this.loader.loadAll(directory);
    return this; // Для чейнинга
  }


  command({ name, code }) {
    this.commands[name] = code;
  }

  async handleUpdate(update) {
    try {
      const context = new AioContext(update);
      const commandName = context.text.split(' ')[0].replace('/', '');
      
      if (this.commands[commandName]) {
        await AioParser.parseBlocks(
          this.commands[commandName],
          context,
          this.actions
        );
      }
  } catch (error) {
    throw AioError.commandExecutionError(
        commandName, 
        context, 
        error
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
    console.log("Starting polling with fetch:", typeof fetch);
    
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
              this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);
            } catch (e) {
              console.error('Update handling error:', e);
            }
          }
        }
      } catch (e) {
        console.error('Polling fatal error:', e);
      }
      
      setTimeout(poll, 500);
    };
    
    poll();
  }
}

module.exports = AioClient;
