import { EModelEndpoint, agentsEndpointSchema } from 'openbiocure-data-provider';
import type { TCustomConfig, TAgentsEndpoint } from 'openbiocure-data-provider';

/**
 * Sets up the Agents configuration from the config (`openbiocure.yaml`) file.
 * If no agents config is defined, uses the provided defaults or parses empty object.
 *
 * @param config - The loaded custom configuration.
 * @param [defaultConfig] - Default configuration from getConfigDefaults.
 * @returns The Agents endpoint configuration.
 */
export function agentsConfigSetup(
  config: TCustomConfig,
  defaultConfig: Partial<TAgentsEndpoint>,
): Partial<TAgentsEndpoint> {
  const agentsConfig = config?.endpoints?.[EModelEndpoint.agents];

  if (!agentsConfig) {
    return defaultConfig || agentsEndpointSchema.parse({});
  }

  const parsedConfig = agentsEndpointSchema.parse(agentsConfig);
  return parsedConfig;
}
