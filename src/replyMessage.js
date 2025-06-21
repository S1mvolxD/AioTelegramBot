module.exports = {
    description: 'Sends a reply to the message',
    params: [
        { name: 'text', type: 'string', required: true }
    ],
    async execute(ctx, text) {
        await ctx.client.api.sendMessage(ctx.chatId, text, {
            reply_to_message_id: ctx.messageId
        });
        return true;
    }
};