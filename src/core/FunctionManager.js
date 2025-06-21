const path = require('path');
const fs = require('fs');
const AioFunction = require('./AioFunction');
const CustomFunction = require('./CustomFunction');

class FunctionManager {
    constructor(client) {
        this.client = client;
        this.functions = new Map();
        this.categories = new Map();
        this.functionFiles = new Map();
    }

    /**
    * Loads all built-in functions from the specified directory
    * @param {string} dirPath - Path to the functions folder
    */
    loadFunctions(dirPath) {
        this._loadFunctionsFromDir(dirPath);
    }

    /**
    * Loads custom functions from the specified directory
    * @param {string} dirPath - Path to the folder with custom functions
     */
    loadCustomFunctions(dirPath) {
        this._loadFunctionsFromDir(dirPath, 'custom');
    }

    _loadFunctionsFromDir(dirPath, type) {
        const categories = fs.readdirSync(dirPath);

        for (const category of categories) {
            const categoryPath = path.join(dirPath, category);
            if (!fs.statSync(categoryPath).isDirectory()) continue;

            const functionFiles = fs.readdirSync(categoryPath)
                .filter(file => file.endsWith('.js'));
                
            for (const file of functionFiles) {
                const filePath = path.join(categoryPath, file);
                try {
                    const funcModule = require(filePath);
                    const funcName = path.basename(file, '.js');
                    const fullName = `$${funcName}`;

                    const func = new AioFunction(
                        {
                            name: fullName,
                            description: funcModule.description || '',
                            params: funcModule.params || []
                        },
                    funcModule.execute
                );

                    this.registerFunction(func, category);
                    this.functionFiles.set(fullName, filePath);
                } catch (error) {
                    console.error(`Error loading the function from ${filePath}:`, error);
                }
            }
        }
    }

    /**
     * Registers the function in the manager
     * @param {Function} func - Function instance
     * @param {string} category - Function category
     */
    registerFunction(func, category = 'uncategorized') {
        this.functions.set(func.name, func);
        
        if (!this.categories.has(category)) {
            this.categories.set(category, []);
        }
        this.categories.get(category).push(func.name);
    }

    /**
     * Creates a custom function
     * @param {Object} data - These functions
     */
    createCustomFunction(data) {
        const func = new CustomFunction(data, this.client);
        this.registerFunction(func, 'custom');
        return func;
    }

    /**
     * Finds dependencies in the code
     * @param {string} code - Code for analysis
     * @returns {Array} - Array of names of dependent functions
     */
    findDependencies(code) {
        const dependencies = new Set();
        const functionNames = Array.from(this.functions.keys());

        for (const funcName of functionNames) {
            if (code.includes(funcName)) {
                dependencies.add(funcName);
            }
        }

        return Array.from(dependencies);
    }

    /**
     * Finds all the functions used in the code
     * @param {string} code - Code for analysis
     * @returns {Array} - Array of function objects
     */
    findFunctionsInCode(code) {
        const found = [];
        const functionNames = Array.from(this.functions.keys());

        for (const funcName of functionNames) {
            if (code.includes(funcName)) {
                found.push(this.functions.get(funcName));
            }
        }

        // Sort by name length (longer names take precedence)
        return found.sort((a, b) => b.name.length - a.name.length);
    }

    /**
     * Gets a function by name
     * @param {string} name - Function name (with $)
     * @returns {Function|null}
     */
    getFunction(name) {
        return this.functions.get(name) || null;
    }

    /**
     * Restarts the function
     * @param {string} name - Function name
     */
    reloadFunction(name) {
        if (!this.functionFiles.has(name)) {
            throw new Error(`Function file ${name} not found`);
        }

        const filePath = this.functionFiles.get(name);
        
        // Deleting the module cache
        delete require.cache[require.resolve(filePath)];
        
        // Reloading the function
        try {
            const funcModule = require(filePath);
            const func = this.getFunction(name);
            
            if (func) {
                func.handler = funcModule.execute;
                func.description = funcModule.description || '';
                func.params = funcModule.params || [];
            }
            
            return func;
        } catch (error) {
            console.error(`Error restarting the function ${name}:`, error);
            return null;
        }
    }
}

module.exports = FunctionManager;