export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  screenshotUrl?: string;
}
