export interface Token { 
    id: number;
    display: string; 
}

export interface TopKEntry extends Token {
  prob: number;
}

export interface GeneratedToken {
  idx: number;
  id: number;
  display: string;
  prob: number;
  topk: TopKEntry[];
}

export interface StartPayload { gen_id: string; prompt_tokens: Token[]; }
export type TokenPayload = GeneratedToken;
export interface DonePayload { gen_id: string; n_tokens: number; }
