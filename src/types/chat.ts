export interface Message {
  sender: 'user' | 'bot';
  content: string;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
}
