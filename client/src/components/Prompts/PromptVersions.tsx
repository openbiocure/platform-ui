import React from 'react';
import { format } from 'date-fns';
import { Layers3, Crown, Zap } from 'lucide-react';
import type { TPrompt, TPromptGroup } from 'openbiocure-data-provider';
import { Tag, TooltipAnchor, Label } from '~/components/ui';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

const CombinedStatusIcon = ({ description }: { description: string }) => (
  <TooltipAnchor
    description={description}
    aria-label={description}
    render={
      <div className="flex items-center justify-center">
                        <Crown className="h-4 w-4 text-opencure-orange-500" />
      </div>
    }
  ></TooltipAnchor>
);

const VersionTags = ({ tags }: { tags: string[] }) => {
  const localize = useLocalize();
  const isLatestAndProduction = tags.includes('latest') && tags.includes('production');

  if (isLatestAndProduction) {
    return (
      <span className="absolute bottom-3 right-3">
        <CombinedStatusIcon description={localize('com_ui_latest_production_version')} />
      </span>
    );
  }

  return (
    <span className="flex gap-1 text-sm">
      {tags.map((tag, i) => (
        <TooltipAnchor
          description={
            tag === 'production'
              ? localize('com_ui_currently_production')
              : localize('com_ui_latest_version')
          }
          key={`${tag}-${i}`}
          aria-label={
            tag === 'production'
              ? localize('com_ui_currently_production')
              : localize('com_ui_latest_version')
          }
          render={
            <Tag
              label={tag}
              className={cn(
                'w-24 justify-center border border-transparent',
                tag === 'production'
                  ? 'bg-opencure-orange-100 text-opencure-orange-600 dark:border-opencure-orange-500 dark:bg-transparent dark:text-opencure-orange-400'
                  : 'bg-opencure-blue-100 text-opencure-blue-600 dark:border-opencure-blue-500 dark:bg-transparent dark:text-opencure-blue-400',
              )}
              labelClassName="flex items-center m-0 justify-center gap-1"
              LabelNode={(() => {
                if (tag === 'production') {
                  return (
                    <div className="flex items-center">
                      <span className="slow-pulse size-2 rounded-full bg-opencure-orange-400" />
                    </div>
                  );
                }
                if (tag === 'latest') {
                  return (
                    <div className="flex items-center">
                      <Zap className="size-4" />
                    </div>
                  );
                }
                return null;
              })()}
            />
          }
        ></TooltipAnchor>
      ))}
    </span>
  );
};

const VersionCard = ({
  prompt,
  index,
  isSelected,
  totalVersions,
  onClick,
  authorName,
  tags,
}: {
  prompt: TPrompt;
  index: number;
  isSelected: boolean;
  totalVersions: number;
  onClick: () => void;
  authorName?: string;
  tags: string[];
}) => {
  const localize = useLocalize();

  return (
    <button
      type="button"
      className={cn(
        'group relative w-full rounded-lg border border-border-light p-4 transition-all duration-300',
        isSelected
          ? 'bg-surface-hover shadow-xl'
          : 'bg-surface-primary shadow-sm hover:bg-surface-secondary',
      )}
      onClick={onClick}
      aria-selected={isSelected}
      role="tab"
      aria-label={localize('com_ui_version_var', { 0: `${totalVersions - index}` })}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between lg:flex-col xl:flex-row">
          <h3 className="font-bold text-text-primary">
            {localize('com_ui_version_var', { 0: `${totalVersions - index}` })}
          </h3>
          <time className="text-xs text-text-secondary" dateTime={prompt.createdAt}>
            {format(new Date(prompt.createdAt), 'yyyy-MM-dd HH:mm')}
          </time>
        </div>

        <div className="flex items-center gap-1 lg:flex-col xl:flex-row">
          {authorName && (
            <Label className="text-left text-xs text-text-secondary">by {authorName}</Label>
          )}

          {tags.length > 0 && <VersionTags tags={tags} />}
        </div>
      </div>
    </button>
  );
};

const PromptVersions = ({
  prompts,
  group,
  selectionIndex,
  setSelectionIndex,
}: {
  prompts: TPrompt[];
  group?: TPromptGroup;
  selectionIndex: number;
  setSelectionIndex: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const localize = useLocalize();

  return (
    <section className="my-6" aria-label="Prompt Versions">
      <header className="mb-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <Layers3 className="h-5 w-5 text-opencure-blue-600" />
          {localize('com_ui_versions')}
        </h2>
      </header>

      <div className="flex flex-col gap-3" role="tablist" aria-label="Version history">
        {prompts.map((prompt: TPrompt, index: number) => {
          const tags: string[] = [];

          if (index === 0) {
            tags.push('latest');
          }

          if (prompt._id === group?.productionId) {
            tags.push('production');
          }

          return (
            <VersionCard
              key={prompt._id}
              prompt={prompt}
              index={index}
              isSelected={index === selectionIndex}
              totalVersions={prompts.length}
              onClick={() => setSelectionIndex(index)}
              authorName={group?.authorName}
              tags={tags}
            />
          );
        })}
      </div>
    </section>
  );
};

export default PromptVersions;
