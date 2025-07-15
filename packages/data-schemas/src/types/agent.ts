import { Document, Types } from 'mongoose';

export interface IAgent extends Omit<Document, 'model'> {
  id: string;
  name?: string;
  description?: string;
  instructions?: string;
  avatar?: {
    filepath: string;
    source: string;
  };
  provider?: string; // Optional for external agents
  model?: string; // Optional for external agents
  model_parameters?: Record<string, unknown>;
  artifacts?: string;
  access_level?: number;
  recursion_limit?: number;
  tools?: string[];
  tool_kwargs?: Array<unknown>;
  actions?: string[];
  author: Types.ObjectId;
  authorName?: string;
  hide_sequential_outputs?: boolean;
  end_after_tools?: boolean;
  agent_ids?: string[];
  isCollaborative?: boolean;
  conversation_starters?: string[];
  tool_resources?: unknown;
  projectIds?: Types.ObjectId[];
  versions?: Omit<IAgent, 'versions'>[];

  // External Agent fields
  isExternal?: boolean;
  externalUrl?: string;
  externalAuth?: {
    type: 'none' | 'api_key' | 'bearer' | 'basic' | 'custom_header';
    apiKey?: string; // Encrypted
    customHeaderName?: string;
    username?: string; // For basic auth
    password?: string; // Encrypted
  };
}
