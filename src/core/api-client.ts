import { HttpClient } from '../utils/http';
import { Logger } from '../utils/logger';
import { InitRequest, InitResponse, ContinueRequest, ContinueResponse } from '../types/api';

export class ForgeRockApiClient {
  private httpClient: HttpClient;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.httpClient = new HttpClient(logger);
  }

  async initJourney(request: InitRequest): Promise<InitResponse> {
    const url = `${request.platformUrl}/am/json/realms/root/realms/${request.realm}/authenticate?authIndexType=service&authIndexValue=${request.journeyName}`;
    
    this.logger.debug(`Initializing journey: ${request.journeyName}`);
    
    try {
      const response = await this.httpClient.post<InitResponse>(url);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to initialize journey: ${error.message}`);
    }
  }

  async continueJourney(request: ContinueRequest, platformUrl: string, realm: string): Promise<ContinueResponse> {
    const url = `${platformUrl}/am/json/realms/root/realms/${realm}/authenticate`;
    
    this.logger.debug(`Continuing journey with authId: ${request.authId}`);
    
    try {
      const response = await this.httpClient.post<ContinueResponse>(url, request);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to continue journey: ${error.message}`);
    }
  }
}