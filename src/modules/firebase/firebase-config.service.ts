export class FireBaseConfigService {
  constructor(public readonly apiKey: string) {
    if (!apiKey) {
      throw new Error('Firebase API key is required');
    }
  }
}
