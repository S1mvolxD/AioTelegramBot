class AioContext {
  constructor(update) {
    this.update = update;
    this.message = update.message;
    this.chatId = this.message.chat.id;
    this.messageId = this.message.message_id;
    this.userId = this.message.from.id;
    this.text = this.message.text;
  }
}

module.exports = AioContext;