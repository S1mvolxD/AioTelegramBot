class AioParser {
  static parseBlocks(code, context, actions) {
    const blockRegex = /\$(\w+)\[([^\]]+)\]/g;
    let match;
    const promises = [];

    while ((match = blockRegex.exec(code)) !== null) {
      const [fullMatch, actionName, arg] = match;
      const action = actions[actionName];
      
      if (action) {
        promises.push(action(context, arg));
      }
    }

    return Promise.all(promises);
  }
}

module.exports = AioParser;