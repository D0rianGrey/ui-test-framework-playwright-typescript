enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
  }
  
  export class Logger {
    private static instance: Logger;
    private showDebug: boolean;
  
    private constructor() {
      this.showDebug = process.env.DEBUG_LOGS === 'true';
    }
  
    public static getInstance(): Logger {
      if (!Logger.instance) {
        Logger.instance = new Logger();
      }
      return Logger.instance;
    }
  
    private formatDate(): string {
      const now = new Date();
      return now.toISOString();
    }
  
    private log(level: LogLevel, message: string, data?: any): void {
      const timestamp = this.formatDate();
      const formattedMessage = `[${timestamp}] [${level}] ${message}`;
      
      switch (level) {
        case LogLevel.DEBUG:
          if (this.showDebug) {
            console.debug(formattedMessage, data || '');
          }
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, data || '');
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, data || '');
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, data || '');
          break;
      }
    }
  
    public debug(message: string, data?: any): void {
      this.log(LogLevel.DEBUG, message, data);
    }
  
    public info(message: string, data?: any): void {
      this.log(LogLevel.INFO, message, data);
    }
  
    public warn(message: string, data?: any): void {
      this.log(LogLevel.WARN, message, data);
    }
  
    public error(message: string, data?: any): void {
      this.log(LogLevel.ERROR, message, data);
    }
  }
  
  // Экспортируем синглтон для удобства использования
  export const logger = Logger.getInstance();