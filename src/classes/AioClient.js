const AioBase = require('./AioBase');
// const AioContext = require('./AioContext');
const AioParser = require('./AioParser');
const LoadCommands = require('./LoadCommands');
const FunctionManager = require('../core/CustomFunction');
const path = require('path');

class AioClient extends AioBase {
  constructor(token) {
    super(token);
    this.commands = new Map();
    this.actions = {};
    this.lastUpdateId = 0; // Initialization for polling
    this.functionManager = new FunctionManager(this); // Initializing the function Manager
    this.loader = new LoadCommands(this);
    
    try {
      this.functionManager.loadBuiltinFunctions(
        path.join(__dirname, '../functions/builtin')
      );
        const customFunctionsPath = path.join(__dirname, '../functions/custom');
        if (fs.existsSync(customFunctionsPath)) {
          this.functionManager.loadCustomFunctions(customFunctionsPath);
        }
        console.log(`✅ Загружено ${this.functionManager.functions.size} функций`);
        } catch (error) {
          console.error('❌ Ошибка загрузки функций:', error);
        }
    this.parser = new AioParser(this);
  }

  loadCommands(directory) {
    this.loader.loadAll(directory);
    return this; //For the changeling
  }


  command({ name, code }) {
    this.commands[name] = code;
  }
  
  /**
  * Command processing
  */
  async handleCommand(ctx) {
    const command = this.commands.get(ctx.commandName);
      if (!command) return;
        
        //We find all the functions in the command code.
        const functions = this.functionManager.findFunctionsInCode(command.code);
        
        // Creating a block of execution
        const block = new Block();
        
        // Adding all the functions to the block
        for (const func of functions) {
            block.add(func);
        }
        
        // Executing the block
        await block.execute(ctx);
    }

  // async sendMessage(context, text) {
  //   return this._callApi('sendMessage', {
  //     chat_id: context.chatId,
  //     text
  //   });
  // }

  // async replyMessage(context, text) {
  //   return this._callApi('sendMessage', {
  //     chat_id: context.chatId,
  //     text,
  //     reply_to_message_id: context.messageId
  //   });
  // }

  async startPolling() {
    console.log("Starting polling with fetch:", typeof fetch);
    
    const poll = async () => {
      try {
        const response = await this._callApi('getUpdates', {
          offset: this.lastUpdateId + 1,
          timeout: 30
        });
        
        if (response.ok && response.result) {
          for (const update of response.result) {
            try {
              await this.handleUpdate(update);
              this.lastUpdateId = Math.max(this.lastUpdateId, update.update_id);
            } catch (e) {
              console.error('Update handling error:', e);
            }
          }
        }
      } catch (e) {
        console.error('Polling fatal error:', e);
      }
      
      setTimeout(poll, 500);
    };
    
    poll();
  }
}

module.exports = AioClient;
