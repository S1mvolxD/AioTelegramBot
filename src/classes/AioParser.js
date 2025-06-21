class AioParser {
  static async parseBlocks(code, context, actions) {
    const blockRegex = /\$(\w+)\[([^\]]+)\]/g;
    const promises = [];
    let match;

    while ((match = blockRegex.exec(code)) !== null) {
      const [fullMatch, actionName, arg] = match;
      const action = actions[actionName];
      
      if (action) {
        try {
          promises.push(action(context, arg));
        } catch (e) {
          console.error(`Error executing ${actionName}:`, e);
        }
      } else {
        console.warn(`Unknown action: ${actionName}`);
      }
    }

    return Promise.all(promises);
  }
}

module.exports = AioParser;
