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
      if (data) {
        this.logger.debug(`Request: ${JSON.stringify(data, null, 2)}`);
      }
      
      const response: AxiosResponse<T> = await this.client.post(url, data);
      
      this.logger.debug(`Response: ${JSON.stringify(response.data, null, 2)}`);
      return response.data;
    } catch (error: any) {
      this.logger.debug(`HTTP Error: ${error.message}`);
      throw error;
    }
  }

  // TODO: Add get, put, delete methods when needed
}