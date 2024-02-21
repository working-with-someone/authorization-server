import type { File } from '../middleware/minions';
export interface ClientCreationInput {
  userId: number;
  client_name: string;
  client_uri: string;
  file?: File;
}

export interface ClientUpdateInput extends ClientCreationInput {
  client_id: string;
  redirect_uri: string;
}

export interface PublicClientInfo {
  client_id: string;
  client_name: string;
  client_uri: string;
  logo_uri: string;
}
