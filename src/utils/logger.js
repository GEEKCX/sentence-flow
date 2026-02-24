/**
 * 统一日志管理工具
 * 生产环境自动禁用 debug/info 级别
 */

const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// 根据环境设置日志级别
const currentLevel = process.env.NODE_ENV === 'production' 
  ? LEVELS.WARN 
  : LEVELS.DEBUG;

class Logger {
  constructor(namespace = '') {
    this.namespace = namespace;
  }

  _formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const ns = this.namespace ? `[${this.namespace}] ` : '';
    return [`${timestamp} ${level}${ns}${message}`, ...args];
  }

  debug(message, ...args) {
    if (currentLevel <= LEVELS.DEBUG) {
      console.debug(...this._formatMessage('[DEBUG]', message, ...args));
    }
  }

  info(message, ...args) {
    if (currentLevel <= LEVELS.INFO) {
      console.info(...this._formatMessage('[INFO]', message, ...args));
    }
  }

  warn(message, ...args) {
    if (currentLevel <= LEVELS.WARN) {
      console.warn(...this._formatMessage('[WARN]', message, ...args));
    }
  }

  error(message, ...args) {
    if (currentLevel <= LEVELS.ERROR) {
      console.error(...this._formatMessage('[ERROR]', message, ...args));
    }
  }

  // 创建带命名空间的logger实例
  static create(namespace) {
    return new Logger(namespace);
  }
}

// 默认导出
export default new Logger();

// 命名导出
export { Logger };
