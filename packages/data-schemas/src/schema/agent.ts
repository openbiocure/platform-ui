import { Schema } from 'mongoose';
import type { IAgent } from '~/types';

const agentSchema = new Schema<IAgent>(
  {
    id: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    instructions: {
      type: String,
    },
    avatar: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    provider: {
      type: String,
      required: function() {
        return !this.isExternal;
      },
      validate: {
        validator: function(v) {
          // Provider is required for non-external agents
          if (!this.isExternal && !v) return false;
          return true;
        },
        message: 'Provider is required for non-external agents'
      }
    },
    model: {
      type: String,
      required: function() {
        return !this.isExternal;
      },
      validate: {
        validator: function(v) {
          // Model is required for non-external agents
          if (!this.isExternal && !v) return false;
          return true;
        },
        message: 'Model is required for non-external agents'
      }
    },
    model_parameters: {
      type: Object,
    },
    artifacts: {
      type: String,
    },
    access_level: {
      type: Number,
    },
    recursion_limit: {
      type: Number,
    },
    tools: {
      type: [String],
      default: undefined,
    },
    tool_kwargs: {
      type: [{ type: Schema.Types.Mixed }],
    },
    actions: {
      type: [String],
      default: undefined,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      default: undefined,
    },
    hide_sequential_outputs: {
      type: Boolean,
    },
    end_after_tools: {
      type: Boolean,
    },
    agent_ids: {
      type: [String],
    },
    isCollaborative: {
      type: Boolean,
      default: undefined,
    },
    conversation_starters: {
      type: [String],
      default: [],
    },
    tool_resources: {
      type: Schema.Types.Mixed,
      default: {},
    },
    projectIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Project',
      index: true,
    },
    versions: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    // External Agent fields
    isExternal: {
      type: Boolean,
      default: false,
    },
    externalUrl: {
      type: String,
      validate: {
        validator: function(v) {
          if (this.isExternal && !v) return false;
          if (v && !/^https?:\/\/.+/.test(v)) return false;
          return true;
        },
        message: 'External URL is required for external agents and must be a valid HTTP/HTTPS URL',
      },
    },
    externalAuth: {
      type: {
        type: String,
        enum: ['none', 'api_key', 'bearer', 'basic', 'custom_header'],
        default: 'none',
      },
      apiKey: {
        type: String,
      },
      customHeaderName: {
        type: String,
        default: 'X-API-Key',
      },
      username: {
        type: String,
      },
      password: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default agentSchema;
