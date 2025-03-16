// Типы сред
export enum Environment {
    LOCAL = 'local',
    DEV = 'dev',
    STAGING = 'staging',
    PROD = 'prod'
  }
  
  // Интерфейс для конфигурации
  interface EnvironmentConfig {
    baseUrl: string;
    credentials: {
      standardUser: { username: string; password: string };
      lockedUser: { username: string; password: string };
    };
    apiUrl?: string;
  }
  
  // Конфигурация для разных сред
  const environmentConfigs: Record<Environment, EnvironmentConfig> = {
    [Environment.LOCAL]: {
      baseUrl: 'https://www.saucedemo.com',
      credentials: {
        standardUser: { username: 'standard_user', password: 'secret_sauce' },
        lockedUser: { username: 'locked_out_user', password: 'secret_sauce' }
      }
    },
    [Environment.DEV]: {
      baseUrl: 'https://www.saucedemo.com',
      credentials: {
        standardUser: { username: 'standard_user', password: 'secret_sauce' },
        lockedUser: { username: 'locked_out_user', password: 'secret_sauce' }
      }
    },
    [Environment.STAGING]: {
      baseUrl: 'https://www.saucedemo.com',
      credentials: {
        standardUser: { username: 'standard_user', password: 'secret_sauce' },
        lockedUser: { username: 'locked_out_user', password: 'secret_sauce' }
      }
    },
    [Environment.PROD]: {
      baseUrl: 'https://www.saucedemo.com',
      credentials: {
        standardUser: { username: 'standard_user', password: 'secret_sauce' },
        lockedUser: { username: 'locked_out_user', password: 'secret_sauce' }
      }
    }
  };
  
  // Получение текущей среды из переменной окружения или использование значения по умолчанию
  const currentEnv = (process.env.TEST_ENV as Environment) || Environment.LOCAL;
  
  // Экспорт конфигурации для текущей среды
  export const config = environmentConfigs[currentEnv];