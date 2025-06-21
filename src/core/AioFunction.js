const Block = require('./Block');

class AioFunction {
    constructor(meta, handler) {
        this.name = meta.name;
        this.description = meta.description || '';
        this.params = meta.params || [];
        this.handler = handler;
        this.block = new Block(this);
    }
    
    execute(ctx, args) {
        return this.handler(ctx, ...args);
    }
    
    addChild(child) {
        this.block.add(child);
        return this;
    }
}

module.exports = AioFunction;