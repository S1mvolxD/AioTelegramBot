const AioFunction = require('./AioFunction'); // Using the renamed class

class CustomFunction extends AioFunction {
    constructor(d, client) {
        super({
            name: d.name,
            description: d.description || 'Custom Function',
            params: d.params || []
        }, d.execute);
        
        this.client = client;
        this.type = d.type || 'custom';
        this.dependencies = [];
        
        // We automatically find dependencies
        if (d.code) {
            this.dependencies = this.client.functionManager.findDependencies(d.code);
        }
    }
}

module.exports = CustomFunction;