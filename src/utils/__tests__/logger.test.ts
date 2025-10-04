import { logger, createLogger, LogLevel } from '../logger';

describe('Logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log debug messages when level is DEBUG', () => {
    logger.setLevel(LogLevel.DEBUG);
    logger.debug('test debug message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log info messages', () => {
    logger.setLevel(LogLevel.INFO);
    logger.info('test info message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    logger.setLevel(LogLevel.WARN);
    logger.warn('test warning');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    logger.setLevel(LogLevel.ERROR);
    logger.error('test error', new Error('test'));
    expect(console.error).toHaveBeenCalled();
  });

  it('should not log debug when level is INFO', () => {
    logger.setLevel(LogLevel.INFO);
    logger.debug('test debug message');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should create named logger', () => {
    const namedLogger = createLogger('TestModule');
    namedLogger.setLevel(LogLevel.INFO);
    namedLogger.info('test message');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('TestModule'));
  });
});
