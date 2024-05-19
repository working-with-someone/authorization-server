import type { File } from '../middleware/minions';
import { ReplacePatch } from './json-patch';

export interface ClientCreationInput {
  userId: number;
  client_name: string;
  client_uri: string;
  file?: File;
}

export interface ClientUpdateInput extends ClientCreationInput {
  client_id: string;
  redirect_uri: string[];
  logo_update_option: 'no-change' | 'update' | 'delete';
}

export interface ClientPatchScopeInput {
  userId: number;
  client_id: string;
  patchDocument: ReplacePatch[];
}

export interface PublicClientInfo {
  client_id: string;
  client_name: string;
  client_uri: string;
  logo_uri: string;
}
