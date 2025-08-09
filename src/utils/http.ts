import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Logger } from './logger';

export class HttpClient {
  private client: AxiosInstance;
  private logger: Logger;

  constructor(logger: Logger, timeout = 30000) {
    this.logger = logger;
    this.client = axios.create({
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept-API-Version': 'resource=2.0, protocol=1.0'
      }
    });
  }

  async post<T>(url: string, data?: any): Promise<T> {
    try {
      this.logger.debug(`POST ${url}`);
      
      if (this.logger.isVerbose()) {
        this.logger.info('=== HTTP REQUEST ===');
        this.logger.info(`URL: ${url}`);
        this.logger.info(`Method: POST`);
        this.logger.info(`Headers: ${JSON.stringify(this.client.defaults.headers, null, 2)}`);
        if (data) {
          this.logger.info(`Body: ${JSON.stringify(data, null, 2)}`);
        }
      } else if (data) {
        this.logger.debug(`Request: ${JSON.stringify(data, null, 2)}`);
      }
      
      const response: AxiosResponse<T> = await this.client.post(url, data);
      
      if (this.logger.isVerbose()) {
        this.logger.info('=== HTTP RESPONSE ===');
        this.logger.info(`Status: ${response.status} ${response.statusText}`);
        this.logger.info(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
        this.logger.info(`Body: ${JSON.stringify(response.data, null, 2)}`);
      } else {
        this.logger.debug(`Response: ${JSON.stringify(response.data, null, 2)}`);
      }
      
      return response.data;
    } catch (error: any) {
      if (this.logger.isVerbose()) {
        this.logger.info('=== HTTP ERROR ===');
        this.logger.info(`Error: ${error.message}`);
        if (error.response) {
          this.logger.info(`Status: ${error.response.status}`);
          this.logger.info(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
        }
      } else {
        this.logger.debug(`HTTP Error: ${error.message}`);
      }
      throw error;
    }
  }

  // TODO: Add get, put, delete methods when needed
}