import React, { useState, useMemo, useCallback } from 'react';
import { EModelEndpoint } from 'openbiocure-data-provider';
import { Controller, useWatch, useFormContext } from 'react-hook-form';
import type { AgentForm, AgentPanelProps, IconComponentTypes } from '~/common';
import { cn, defaultTextProps, removeFocusOutlines, getEndpointField, getIconKey } from '~/utils';
import { useToastContext, useFileMapContext, useAgentPanelContext } from '~/Providers';
import useAgentCapabilities from '~/hooks/Agents/useAgentCapabilities';
import Action from '~/components/SidePanel/Builder/Action';
import { ToolSelectDialog } from '~/components/Tools';
import { useGetAgentFiles } from '~/data-provider';
import { icons } from '~/hooks/Endpoint/Icons';
import { processAgentOption } from '~/utils';
import Instructions from './Instructions';
import AgentAvatar from './AgentAvatar';
import FileContext from './FileContext';
import SearchForm from './Search/Form';
import { useLocalize } from '~/hooks';
import FileSearch from './FileSearch';
import Artifacts from './Artifacts';
import AgentTool from './AgentTool';
import CodeForm from './Code/Form';
import { Panel } from '~/common';
import { Switch } from '~/components/ui';

// CSS classes for consistent styling
const labelClass = 'mb-2 text-token-text-primary block font-medium';
const inputClass = cn(
  defaultTextProps,
  'flex w-full px-3 py-2 border-border-light bg-surface-secondary focus-visible:ring-2 focus-visible:ring-ring-primary',
  removeFocusOutlines,
);

/**
 * AgentConfig Component
 * 
 * Main configuration panel for agents, handling both regular and external agents.
 * For external agents, it provides a dynamic authentication form based on the selected auth type.
 * For regular agents, it shows model selection, instructions, capabilities, and tools.
 */
export default function AgentConfig({ createMutation }: Pick<AgentPanelProps, 'createMutation'>) {
  const localize = useLocalize();
  const fileMap = useFileMapContext();
  const { showToast } = useToastContext();
  const methods = useFormContext<AgentForm>();
  const [showToolDialog, setShowToolDialog] = useState(false);
  const {
    actions,
    setAction,
    agentsConfig,
    setActivePanel,
    endpointsConfig,
    groupedTools: allTools,
  } = useAgentPanelContext();

  // Form control and watched values
  const { control } = methods;
  const provider = useWatch({ control, name: 'provider' });
  const model = useWatch({ control, name: 'model' });
  const agent = useWatch({ control, name: 'agent' });
  const tools = useWatch({ control, name: 'tools' });
  const agent_id = useWatch({ control, name: 'id' });
  
  // External agent specific fields
  const isExternal = useWatch({ control, name: 'isExternal' });
  const externalUrl = useWatch({ control, name: 'externalUrl' });
  const externalAuth = useWatch({ control, name: 'externalAuth' });

  // Use agent files to build a merged file map for context/knowledge/code files
  const { data: agentFiles = [] } = useGetAgentFiles(agent_id);
  const mergedFileMap = useMemo(() => {
    const newFileMap = { ...fileMap };
    agentFiles.forEach((file) => {
      if (file.file_id) {
        newFileMap[file.file_id] = file;
      }
    });
    return newFileMap;
  }, [fileMap, agentFiles]);

  // Agent capabilities based on configuration
  const {
    ocrEnabled,
    codeEnabled,
    toolsEnabled,
    actionsEnabled,
    artifactsEnabled,
    webSearchEnabled,
    fileSearchEnabled,
  } = useAgentCapabilities(agentsConfig?.capabilities);

  // Memoized file contexts for different agent capabilities
  const context_files = useMemo(() => {
    if (typeof agent === 'string') {
      return [];
    }

    if (agent?.id !== agent_id) {
      return [];
    }

    if (agent.context_files) {
      return agent.context_files;
    }

    const _agent = processAgentOption({
      agent,
      fileMap: mergedFileMap,
    });
    return _agent.context_files ?? [];
  }, [agent, agent_id, mergedFileMap]);

  const knowledge_files = useMemo(() => {
    if (typeof agent === 'string') {
      return [];
    }

    if (agent?.id !== agent_id) {
      return [];
    }

    if (agent.knowledge_files) {
      return agent.knowledge_files;
    }

    const _agent = processAgentOption({
      agent,
      fileMap: mergedFileMap,
    });
    return _agent.knowledge_files ?? [];
  }, [agent, agent_id, mergedFileMap]);

  const code_files = useMemo(() => {
    if (typeof agent === 'string') {
      return [];
    }

    if (agent?.id !== agent_id) {
      return [];
    }

    if (agent.code_files) {
      return agent.code_files;
    }

    const _agent = processAgentOption({
      agent,
      fileMap: mergedFileMap,
    });
    return _agent.code_files ?? [];
  }, [agent, agent_id, mergedFileMap]);

  // Handler for adding actions to the agent
  const handleAddActions = useCallback(() => {
    if (!agent_id) {
      showToast({
        message: localize('com_assistants_actions_disabled'),
        status: 'warning',
      });
      return;
    }
    setActivePanel(Panel.actions);
  }, [agent_id, setActivePanel, showToast, localize]);

  // Provider and icon setup for model selection
  const providerValue = typeof provider === 'string' ? provider : provider?.value;
  let Icon: IconComponentTypes | null | undefined;
  let endpointType: EModelEndpoint | undefined;
  let endpointIconURL: string | undefined;
  let iconKey: string | undefined;

  if (providerValue !== undefined) {
    endpointType = getEndpointField(endpointsConfig, providerValue as string, 'type');
    endpointIconURL = getEndpointField(endpointsConfig, providerValue as string, 'iconURL');
    iconKey = getIconKey({
      endpoint: providerValue as string,
      endpointsConfig,
      endpointType,
      endpointIconURL,
    });
    Icon = icons[iconKey];
  }

  // Tool visibility logic - show parent tools if any subtools are selected
  const selectedToolIds = tools ?? [];
  const visibleToolIds = new Set(selectedToolIds);

  // Check what group parent tools should be shown if any subtool is present
  Object.entries(allTools ?? {}).forEach(([toolId, toolObj]) => {
    if (toolObj.tools?.length) {
      // if any subtool of this group is selected, ensure group parent tool rendered
      if (toolObj.tools.some((st) => selectedToolIds.includes(st.tool_id))) {
        visibleToolIds.add(toolId);
      }
    }
  });

  // State to preserve model/provider values when switching to/from external mode
  const [prevModel, setPrevModel] = useState<string | null>(null);
  const [prevProvider, setPrevProvider] = useState<string | null>(null);

  /**
   * Effect to handle external agent mode switching
   * When isExternal is true, we set model/provider to 'external' and disable them
   * When switching back, we restore the previous values
   */
  React.useEffect(() => {
    if (isExternal) {
      // Save previous values before switching to external mode
      if (!prevModel && model) setPrevModel(model);
      if (!prevProvider && provider) setPrevProvider(provider);
      // Set to 'external' and disable model/provider selection
      methods.setValue('model', 'external');
      methods.setValue('provider', 'external');
    } else {
      // Restore previous values when switching back from external mode
      if (prevModel) methods.setValue('model', prevModel);
      if (prevProvider) methods.setValue('provider', prevProvider);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExternal]);

  return (
    <>
      <div className="h-auto bg-white px-4 pt-3 dark:bg-transparent">
        {/* Avatar & Name Section */}
        <div className="mb-4">
          <AgentAvatar
            agent_id={agent_id}
            createMutation={createMutation}
            avatar={agent?.['avatar'] ?? null}
          />
          <label className={labelClass} htmlFor="name">
            {localize('com_ui_name')}
          </label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                value={field.value ?? ''}
                maxLength={256}
                className={inputClass}
                id="name"
                type="text"
                placeholder={localize('com_agents_name_placeholder')}
                aria-label="Agent name"
              />
            )}
          />
          <Controller
            name="id"
            control={control}
            render={({ field }) => (
              <p className="h-3 text-xs italic text-text-secondary" aria-live="polite">
                {field.value}
              </p>
            )}
          />
        </div>
        
        {/* Description Section */}
        <div className="mb-4">
          <label className={labelClass} htmlFor="description">
            {localize('com_ui_description')}
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                value={field.value ?? ''}
                maxLength={512}
                className={inputClass}
                id="description"
                type="text"
                placeholder={localize('com_agents_description_placeholder')}
                aria-label="Agent description"
              />
            )}
          />
        </div>
        
        {/* External Agent Toggle Switch */}
        <div className="mb-4 flex items-center gap-2">
          <Switch
            checked={!!isExternal}
            onCheckedChange={(checked) => methods.setValue('isExternal', checked)}
            id="external-agent-switch"
          />
          <label htmlFor="external-agent-switch" className={labelClass}>
            {localize('com_agents_external_agent')}
          </label>
          <span className="text-xs text-text-secondary ml-2">
            {localize('com_agents_external_agent_help') ||
              'Enable to delegate this agent to an external HTTP endpoint.'}
          </span>
        </div>

        {/* External Agent Configuration Section */}
        {isExternal && (
          <div className="mb-4 space-y-4">
            {/* External URL Configuration */}
            <div>
              <label className={labelClass} htmlFor="externalUrl">
                {localize('com_agents_external_url') || 'External Agent URL'} <span className="text-red-500">*</span>
              </label>
              <Controller
                name="externalUrl"
                control={control}
                rules={{ required: isExternal }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <input
                      {...field}
                      value={field.value ?? ''}
                      className={`${inputClass} ${error ? 'border-red-500' : ''}`}
                      id="externalUrl"
                      type="url"
                      placeholder={localize('com_agents_external_url_placeholder') || 'https://api.example.com/agent'}
                      aria-label="External Agent URL"
                    />
                    {error && (
                      <span className="text-xs text-red-500">
                        {localize('com_ui_field_required') || 'This field is required'}
                      </span>
                    )}
                  </>
                )}
              />
              <span className="text-xs text-text-secondary">
                {localize('com_agents_external_url_help') ||
                  'The HTTP endpoint to which this agent will delegate requests.'}
              </span>
            </div>

            {/* Authentication Type Selection */}
            <div>
              <label className={labelClass} htmlFor="externalAuth.type">
                {localize('com_agents_external_auth_type') || 'Authentication Type'}
              </label>
              <Controller
                name="externalAuth.type"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className={inputClass}
                    id="externalAuth.type"
                    value={field.value || 'none'}
                  >
                    <option value="none">None</option>
                    <option value="api_key">API Key</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="custom_header">Custom Header</option>
                  </select>
                )}
              />
              <span className="text-xs text-text-secondary">
                {localize('com_agents_external_auth_type_help') ||
                  'Select the authentication method required by your external agent endpoint.'}
              </span>
            </div>

            {/* Dynamic Authentication Fields */}
            <Controller
              name="externalAuth"
              control={control}
              render={({ field }) => {
                const type = field.value?.type || 'none';
                const authValue = field.value || {};
                
                return (
                  <div className="space-y-3">
                    {/* API Key / Bearer Token / Custom Header Authentication */}
                    {(type === 'api_key' || type === 'bearer' || type === 'custom_header') && (
                      <div className="space-y-2">
                        <label className={labelClass} htmlFor="externalAuth.apiKey">
                          {type === 'bearer'
                            ? localize('com_agents_external_bearer_token') || 'Bearer Token'
                            : localize('com_agents_external_api_key') || 'API Key'}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="externalAuth.apiKey"
                          type="password"
                          className={inputClass}
                          value={authValue.apiKey ?? ''}
                          onChange={(e) => field.onChange({ ...authValue, apiKey: e.target.value })}
                          id="externalAuth.apiKey"
                          placeholder={
                            type === 'bearer'
                              ? localize('com_agents_external_bearer_token_placeholder') || 'Enter Bearer Token'
                              : localize('com_agents_external_api_key_placeholder') || 'Enter API Key'
                          }
                        />
                        <span className="text-xs text-text-secondary">
                          {type === 'bearer'
                            ? localize('com_agents_external_bearer_token_help') || 'The Bearer token for authentication'
                            : localize('com_agents_external_api_key_help') || 'The API key for authentication'}
                        </span>
                      </div>
                    )}

                    {/* Custom Header Name Field (for API Key and Custom Header auth types) */}
                    {(type === 'custom_header' || type === 'api_key') && (
                      <div className="space-y-2">
                        <label className={labelClass} htmlFor="externalAuth.customHeaderName">
                          {localize('com_agents_external_custom_header') || 'Custom Header Name'}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="externalAuth.customHeaderName"
                          type="text"
                          className={inputClass}
                          value={authValue.customHeaderName ?? ''}
                          onChange={(e) => field.onChange({ ...authValue, customHeaderName: e.target.value })}
                          id="externalAuth.customHeaderName"
                          placeholder={localize('com_agents_external_custom_header_placeholder') || 'X-API-Key'}
                        />
                        <span className="text-xs text-text-secondary">
                          {localize('com_agents_external_custom_header_help') ||
                            'The name of the header to send the API key in (e.g., X-API-Key, Authorization)'}
                        </span>
                      </div>
                    )}

                    {/* Basic Authentication Username */}
                    {type === 'basic' && (
                      <div className="space-y-2">
                        <label className={labelClass} htmlFor="externalAuth.username">
                          {localize('com_agents_external_username') || 'Username'}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="externalAuth.username"
                          type="text"
                          className={inputClass}
                          value={authValue.username ?? ''}
                          onChange={(e) => field.onChange({ ...authValue, username: e.target.value })}
                          id="externalAuth.username"
                          placeholder={localize('com_agents_external_username_placeholder') || 'Enter Username'}
                        />
                        <span className="text-xs text-text-secondary">
                          {localize('com_agents_external_username_help') || 'The username for Basic authentication'}
                        </span>
                      </div>
                    )}

                    {/* Basic Authentication Password */}
                    {type === 'basic' && (
                      <div className="space-y-2">
                        <label className={labelClass} htmlFor="externalAuth.password">
                          {localize('com_agents_external_password') || 'Password'}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="externalAuth.password"
                          type="password"
                          className={inputClass}
                          value={authValue.password ?? ''}
                          onChange={(e) => field.onChange({ ...authValue, password: e.target.value })}
                          id="externalAuth.password"
                          placeholder={localize('com_agents_external_password_placeholder') || 'Enter Password'}
                        />
                        <span className="text-xs text-text-secondary">
                          {localize('com_agents_external_password_help') || 'The password for Basic authentication'}
                        </span>
                      </div>
                    )}

                    {/* No Authentication Message */}
                    {type === 'none' && (
                      <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          {localize('com_agents_external_no_auth_message') ||
                            'No authentication required. The external agent will be called without authentication headers.'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
        )}

        {/* Regular Agent Configuration (hidden when isExternal is true) */}
        {!isExternal && (
          <>
            {/* Instructions Section */}
            <Instructions />
            
            {/* Model and Provider Selection */}
            <div className="mb-4">
              <label className={labelClass} htmlFor="provider">
                {localize('com_ui_model')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setActivePanel(Panel.model)}
                className="btn btn-neutral border-token-border-light relative h-10 w-full rounded-lg font-medium"
                aria-haspopup="true"
                aria-expanded="false"
                disabled={isExternal} // Disable if external
              >
                <div className="flex w-full items-center gap-2">
                  {Icon && (
                    <div className="shadow-stroke relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-black dark:bg-white">
                      <Icon
                        className="h-2/3 w-2/3"
                        endpoint={providerValue as string}
                        endpointType={endpointType}
                        iconURL={endpointIconURL}
                      />
                    </div>
                  )}
                  <span>{model != null && model ? model : localize('com_ui_select_model')}</span>
                </div>
              </button>
            </div>
            
            {/* Agent Capabilities Section */}
            {(codeEnabled ||
              fileSearchEnabled ||
              artifactsEnabled ||
              ocrEnabled ||
              webSearchEnabled) && (
              <div className="mb-4 flex w-full flex-col items-start gap-3">
                <label className="text-token-text-primary block font-medium">
                  {localize('com_assistants_capabilities')}
                </label>
                {/* Code Execution Capability */}
                {codeEnabled && <CodeForm agent_id={agent_id} files={code_files} />}
                {/* Web Search Capability */}
                {webSearchEnabled && <SearchForm />}
                {/* File Context (OCR) Capability */}
                {ocrEnabled && <FileContext agent_id={agent_id} files={context_files} />}
                {/* Artifacts Capability */}
                {artifactsEnabled && <Artifacts />}
                {/* File Search Capability */}
                {fileSearchEnabled && <FileSearch agent_id={agent_id} files={knowledge_files} />}
              </div>
            )}
            
            {/* Agent Tools & Actions Section */}
            <div className="mb-4">
              <label className={labelClass}>
                {`${toolsEnabled === true ? localize('com_ui_tools') : ''}
                  ${toolsEnabled === true && actionsEnabled === true ? ' + ' : ''}
                  ${actionsEnabled === true ? localize('com_assistants_actions') : ''}`}
              </label>
              <div>
                <div className="mb-1">
                  {/* Render all visible tool IDs (including groups with subtools selected) */}
                  {[...visibleToolIds].map((toolId, i) => {
                    if (!allTools) return null;
                    const tool = allTools[toolId];
                    if (!tool) return null;
                    return (
                      <AgentTool
                        key={`${toolId}-${i}-${agent_id}`}
                        tool={toolId}
                        allTools={allTools}
                        agent_id={agent_id}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-col gap-1">
                  {/* Display existing actions for this agent */}
                  {(actions ?? [])
                    .filter((action) => action.agent_id === agent_id)
                    .map((action, i) => (
                      <Action
                        key={i}
                        action={action}
                        onClick={() => {
                          setAction(action);
                          setActivePanel(Panel.actions);
                        }}
                      />
                    ))}
                </div>
                <div className="mt-2 flex space-x-2">
                  {/* Add Tools Button */}
                  {(toolsEnabled ?? false) && (
                    <button
                      type="button"
                      onClick={() => setShowToolDialog(true)}
                      className="btn btn-neutral border-token-border-light relative h-9 w-full rounded-lg font-medium"
                      aria-haspopup="dialog"
                    >
                      <div className="flex w-full items-center justify-center gap-2">
                        {localize('com_assistants_add_tools')}
                      </div>
                    </button>
                  )}
                  {/* Add Actions Button */}
                  {(actionsEnabled ?? false) && (
                    <button
                      type="button"
                      disabled={!agent_id}
                      onClick={handleAddActions}
                      className="btn btn-neutral border-token-border-light relative h-9 w-full rounded-lg font-medium"
                      aria-haspopup="dialog"
                    >
                      <div className="flex w-full items-center justify-center gap-2">
                        {localize('com_assistants_add_actions')}
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* MCP Section - Currently commented out */}
            {/* <MCPSection /> */}
          </>
        )}
      </div>
      
      {/* Tool Selection Dialog */}
      <ToolSelectDialog
        isOpen={showToolDialog}
        setIsOpen={setShowToolDialog}
        endpoint={EModelEndpoint.agents}
      />
    </>
  );
}
