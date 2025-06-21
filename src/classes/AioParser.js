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
        } catch (error) {
            throw AioError.blockParseError(
              actionName, 
              arg, 
              error
            );
        }
      } else {
        console.warn(`Unknown action: ${actionName}`);
      }
    }

    return Promise.all(promises);
  }

}

module.exports = AioParser;
