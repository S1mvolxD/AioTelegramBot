class Block {
    constructor(func) {
        this.parent = func;
        this.children = [];
    }
    
    add(child) {
        this.children.push(child);
        return this;
    }
    
    execute(ctx, args) {
        // Recursive execution of a block and its child elements
        const results = [];
        
        // Performing the parent function
        if (this.parent) {
            results.push(this.parent.execute(ctx, args));
        }
        
        // Executing child elements
        for (const child of this.children) {
            if (child instanceof Block) {
                results.push(child.execute(ctx, args));
            } else if (typeof child === 'function') {
                results.push(child(ctx, args));
            }
        }
        
        return Promise.all(results);
    }
}

module.exports = Block;
