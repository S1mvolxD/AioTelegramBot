class AioError extends Error {
  /**
   * Creates an instance of AioError
   * @param {string} message - The main error message
   * @param {string} code - Error code for identification
   * @param {Object} [context={}] - Additional error context
   * @param {string} [module] - The module where the error occurred
   */
  constructor(message, code, context = {}, module) {
    super(message);
    this.name = 'AioError';
    this.code = code;
    this.context = context;
    this.module = module || 'Unknown';
    this.timestamp = new Date().toISOString();
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AioError);
    }
  }

  /**
   * Converts the error to JSON format
   * @returns {Object}
   */
  toJSON() {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      module: this.module,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    };
  }

  /**
   * Creates an error for the API
   * @param {string} method - API Method
   * @param {Object} params - Request Parameters
   * @param {Error} originalError - The original error
   * @returns {AioError}
   */
  static apiError(method, params, originalError) {
    return new AioError(
      `API call failed: ${originalError.message}`,
      'API_FAILURE',
      {
        method,
        params,
        originalError: originalError.message
      },
      'AioBase'
    );
  }

  /**
   * Creates a command loading error
   * @param {string} filePath - The path to the command file
   * @param {Error} originalError - The original error
   * @returns {AioError}
   */
  static commandLoadError(filePath, originalError) {
    return new AioError(
      `Command load failed: ${originalError.message}`,
      'COMMAND_LOAD_FAILED',
      {
        filePath,
        originalError: originalError.message
      },
      'LoadCommands'
    );
  }

  /**
   * Creates a command execution error
   * @param {string} commandName - Command name
   * @param {Object} context - Execution context
   * @param {Error} originalError - The original error
   * @returns {AioError}
   */
  static commandExecutionError(commandName, context, originalError) {
    return new AioError(
      `Command execution failed: ${originalError.message}`,
      'COMMAND_EXECUTION_FAILED',
      {
        commandName,
        context,
        originalError: originalError.message
      },
      'AioClient'
    );
  }

  /**
   * Creates a block parsing error
   * @param {string} actionName - Action Name
   * @param {string} arg - The action argument
   * @param {Error} originalError - The original error
   * @returns {AioError}
   */
  static blockParseError(actionName, arg, originalError) {
    return new AioError(
      `Block execution failed: ${originalError.message}`,
      'BLOCK_EXECUTION_FAILED',
      {
        actionName,
        arg,
        originalError: originalError.message
      },
      'AioParser'
    );
  }
}

module.exports = AioError;