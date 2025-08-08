import { Logger } from '../src/utils/logger';

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;
  
  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });
  
  afterEach(() => {
    consoleSpy.mockRestore();
  });
  
  test('should log info messages', () => {
    const logger = new Logger();
    logger.info('test message');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('ℹ'),
      'test message'
    );
  });
  
  test('should log debug messages only when verbose', () => {
    const logger = new Logger(true);
    logger.debug('debug message');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('🐛'),
      'debug message'
    );
  });
  
  test('should not log debug messages when not verbose', () => {
    const logger = new Logger(false);
    logger.debug('debug message');
    
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});