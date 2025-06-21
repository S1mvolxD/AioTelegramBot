const AioError = require('./AioError');
const fs = require('fs');
const path = require('path');

class LoadCommands {
    constructor(client) {
      this.client = client;
      this.commands = new Map();
    }

    loadAll(directory) {
      this._loadCommands(directory);
      console.log(`Uploaded ${this.commands.size} commands`);
      return this;
    }

    _loadCommands(directory, prefix = '') {
      const files = fs.readdirSync(directory);

      for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Recursive loading of subfolders
          const newPrefix = prefix ? `${prefix}${file}/` : `${file}/`;
          this._loadCommands(fullPath, newPrefix);
        } else if (file.endsWith('.js')) {
          // Uploading the command file
          this._loadCommand(fullPath, prefix);
        }
      }
    }

    _validateCommand(command) {
    if (!command.name) {
        throw new Error('Команда должна иметь поле "name"');
    }
    if (!command.code) {
        throw new Error('Команда должна иметь поле "code"');
    }
    return true;
    }

    _loadCommand(filePath, prefix) {
      try {
          const commandModule = require(filePath);
          this._validateCommand(commandModule.command);
          const commandName = path.basename(filePath, '.js');
          const fullCommandName = prefix ? `${prefix}${commandName}` : commandName;

          if (typeof commandModule === 'function') {
              // For commands exported as a function
              commandModule(this.client);
          } else if (commandModule.command) {
              // For command objects
              this.client.command(commandModule.command);
              this.commands.set(fullCommandName, commandModule);
          } else {
              console.warn(`⚠️ The file ${filePath} does not export the command`);
          }
          } catch (error) {
            throw AioError.commandLoadError(filePath, error);
          }
    }

    reloadCommand(filePath) {
      // Delete the module cache for reboot
      delete require.cache[require.resolve(filePath)];
      this._loadCommand(filePath, '');
      console.log(`♻️ The command has been reloaded: ${path.basename(filePath, '.js')}`);
    }

    getCommand(name) {
      return this.commands.get(name);
    }
}

module.exports = LoadCommands;
