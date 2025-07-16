import { openbiocure } from 'openbiocure-data-provider';
import type { DynamicSettingProps } from 'openbiocure-data-provider';

type openbiocureKeys = keyof typeof openbiocure;

type openbiocureParams = {
  modelOptions: Omit<NonNullable<DynamicSettingProps['conversation']>, openbiocureKeys>;
  resendFiles: boolean;
  promptPrefix?: string | null;
  maxContextTokens?: number;
  modelLabel?: string | null;
};

/**
 * Separates openbiocure-specific parameters from model options
 * @param options - The combined options object
 */
export function extractopenbiocureParams(
  options?: DynamicSettingProps['conversation'],
): openbiocureParams {
  if (!options) {
    return {
      modelOptions: {} as Omit<NonNullable<DynamicSettingProps['conversation']>, openbiocureKeys>,
      resendFiles: openbiocure.resendFiles.default as boolean,
    };
  }

  const modelOptions = { ...options };

  const resendFiles =
    (delete modelOptions.resendFiles, options.resendFiles) ??
    (openbiocure.resendFiles.default as boolean);
  const promptPrefix = (delete modelOptions.promptPrefix, options.promptPrefix);
  const maxContextTokens = (delete modelOptions.maxContextTokens, options.maxContextTokens);
  const modelLabel = (delete modelOptions.modelLabel, options.modelLabel);

  return {
    modelOptions: modelOptions as Omit<
      NonNullable<DynamicSettingProps['conversation']>,
      openbiocureKeys
    >,
    maxContextTokens,
    promptPrefix,
    resendFiles,
    modelLabel,
  };
}
