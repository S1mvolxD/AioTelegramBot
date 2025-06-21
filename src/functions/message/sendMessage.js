module.exports = {
    description: 'Sends a message to the chat',
    params: [
        { name: 'text', type: 'string', required: true }
    ],
    async execute(ctx, text) {
        await ctx.client.api.sendMessage(ctx.chatId, text);
        return true;
    }
};