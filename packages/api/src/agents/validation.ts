import { z } from 'zod';

/** Avatar schema shared between create and update */
export const agentAvatarSchema = z.object({
  filepath: z.string(),
  source: z.string(),
});

/** Base resource schema for tool resources */
export const agentBaseResourceSchema = z.object({
  file_ids: z.array(z.string()).optional(),
  files: z.array(z.any()).optional(), // Files are populated at runtime, not from user input
});

/** File resource schema extends base with vector_store_ids */
export const agentFileResourceSchema = agentBaseResourceSchema.extend({
  vector_store_ids: z.array(z.string()).optional(),
});

/** Tool resources schema matching AgentToolResources interface */
export const agentToolResourcesSchema = z
  .object({
    image_edit: agentBaseResourceSchema.optional(),
    execute_code: agentBaseResourceSchema.optional(),
    file_search: agentFileResourceSchema.optional(),
    ocr: agentBaseResourceSchema.optional(),
  })
  .optional();

/** Base agent schema with all common fields */
export const agentBaseSchema = z.object({
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  avatar: agentAvatarSchema.nullable().optional(),
  model_parameters: z.record(z.unknown()).optional(),
  tools: z.array(z.string()).optional(),
  agent_ids: z.array(z.string()).optional(),
  end_after_tools: z.boolean().optional(),
  hide_sequential_outputs: z.boolean().optional(),
  artifacts: z.string().optional(),
  recursion_limit: z.number().optional(),
  conversation_starters: z.array(z.string()).optional(),
  tool_resources: agentToolResourcesSchema,
  // External Agent fields
  isExternal: z.boolean().optional(),
  externalUrl: z.string().url().optional(),
  externalAuth: z
    .object({
      type: z.enum(['none', 'api_key', 'bearer', 'basic', 'custom_header']).optional(),
      apiKey: z.string().optional(),
      customHeaderName: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
    })
    .optional(),
});

/** Create schema extends base with required fields for creation */
export const agentCreateSchema = agentBaseSchema.extend({
  provider: z.string().optional(),
  model: z.string().nullable().optional(),
  tools: z.array(z.string()).optional().default([]),
}).superRefine((data, ctx) => {
  // Only require provider if not external
  if (!data.isExternal && !data.provider) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provider is required for non-external agents",
      path: ["provider"]
    });
  }
  // Only require model if not external
  if (!data.isExternal && (data.model === null || data.model === undefined)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Model is required for non-external agents",
      path: ["model"]
    });
  }
  // For external agents, externalUrl is required
  if (data.isExternal && !data.externalUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "External URL is required when isExternal is true",
      path: ["externalUrl"]
    });
  }
  // Validate externalAuth fields based on auth type
  if (data.externalAuth) {
    const { type, apiKey, username, password } = data.externalAuth;
    if ((type === 'api_key' || type === 'bearer') && !apiKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "API key is required for this authentication type",
        path: ["externalAuth", "apiKey"]
      });
    }
    if (type === 'basic') {
      if (!username) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Username is required for basic authentication",
          path: ["externalAuth", "username"]
        });
      }
      if (!password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password is required for basic authentication",
          path: ["externalAuth", "password"]
        });
      }
    }
  }
});

/** Update schema extends base with all fields optional and additional update-only fields */
export const agentUpdateSchema = agentBaseSchema.extend({
  provider: z.string().optional(),
  model: z.string().nullable().optional(),
  projectIds: z.array(z.string()).optional(),
  removeProjectIds: z.array(z.string()).optional(),
  isCollaborative: z.boolean().optional(),
});
