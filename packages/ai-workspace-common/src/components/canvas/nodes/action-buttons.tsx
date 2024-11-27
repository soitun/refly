import {
  MoreHorizontal,
  PlayCircle,
  FileInput,
  Link,
  HelpCircle,
  Info,
  Trash2,
  Loader2,
  MessageSquareDiff,
  FileText,
  FilePlus,
} from 'lucide-react';
import { useState } from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';

// Action button types
type ActionButtonProps = {
  icon: React.ReactNode;
  onClick: (e: any) => void;
  loading?: boolean;
  tooltip?: string;
  withTooltip?: boolean;
};

// Common action button component
const ActionButton = ({ icon, onClick, loading, tooltip, withTooltip = true }: ActionButtonProps) => {
  const button = (
    <Button
      className="
        p-2
        rounded-lg
        bg-white
        hover:bg-gray-50
        text-[rgba(0,0,0,0.5)]
        transition-colors
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
      type="text"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
    </Button>
  );

  // Return button with or without tooltip based on withTooltip prop
  return withTooltip ? (
    <Tooltip title={tooltip} placement="top" mouseEnterDelay={0.5} overlayClassName="!px-2 !py-1" arrow={false}>
      {button}
    </Tooltip>
  ) : (
    button
  );
};

type ActionButtonsProps = {
  type: 'document' | 'resource' | 'skill-response';
  onAddToContext?: () => void;
  onAddToChatHistory?: () => void;
  onRerun?: () => void;
  onInsertToDoc?: () => void;
  onDelete?: () => void;
  onHelpLink?: () => void;
  onAbout?: () => void;
  isProcessing?: boolean;
  isCompleted?: boolean;
  onCreateDocument?: () => void;
  isCreatingDocument?: boolean;
};

export const ActionButtons = ({
  type,
  onAddToContext,
  onAddToChatHistory,
  onRerun,
  onInsertToDoc,
  onDelete,
  onHelpLink,
  onAbout,
  isProcessing,
  isCompleted,
  onCreateDocument,
  isCreatingDocument,
}: ActionButtonsProps) => {
  // Define dropdown menu items
  const menuItems: MenuProps['items'] = [
    {
      key: 'delete',
      label: (
        <div className="flex items-center gap-2 text-red-600 whitespace-nowrap">
          <Trash2 className="w-4 h-4 flex-shrink-0" />
          Delete
        </div>
      ),
      onClick: onDelete,
      className: 'hover:bg-red-50',
    },
    {
      key: 'helpLink',
      label: (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          Help Link
        </div>
      ),
      onClick: onHelpLink,
    },
    {
      key: 'about',
      label: (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Info className="w-4 h-4 flex-shrink-0" />
          About
        </div>
      ),
      onClick: onAbout,
    },
  ];

  return (
    <div
      className="
        absolute 
        -top-12
        right-0
        opacity-0 
        group-hover:opacity-100
        transition-opacity 
        duration-200
        ease-in-out
        z-50
        flex
        gap-1
        p-1
        rounded-lg
        bg-white
        border-[0.5px]
        border-[rgba(0,0,0,0.03)]
        shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]
      "
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {/* Document specific buttons */}
      {type === 'document' && onAddToContext && (
        <ActionButton
          icon={<MessageSquareDiff className="w-4 h-4" />}
          onClick={onAddToContext}
          tooltip="Add to Context"
        />
      )}

      {/* Resource specific buttons */}
      {type === 'resource' && (
        <>
          {onAddToContext && (
            <ActionButton
              icon={<MessageSquareDiff className="w-4 h-4" />}
              onClick={onAddToContext}
              tooltip="Add to Context"
            />
          )}
          {isProcessing && (
            <ActionButton
              icon={<Loader2 className="w-4 h-4" />}
              onClick={() => {}}
              loading={true}
              tooltip="Processing Vector"
            />
          )}
        </>
      )}

      {/* Skill Response specific buttons */}
      {type === 'skill-response' && (
        <>
          {onRerun && (
            <ActionButton
              icon={<PlayCircle className="w-4 h-4" />}
              onClick={onRerun}
              loading={!isCompleted}
              tooltip="Rerun"
            />
          )}
          {onInsertToDoc && (
            <ActionButton
              icon={<FileInput className="w-4 h-4" />}
              onClick={onInsertToDoc}
              tooltip="Insert to Document"
            />
          )}
          {onAddToChatHistory && (
            <ActionButton
              icon={<MessageSquareDiff className="w-4 h-4" />}
              onClick={onAddToChatHistory}
              tooltip="Add to Chat History"
            />
          )}
          {onCreateDocument && (
            <ActionButton
              icon={<FilePlus className="w-4 h-4" />}
              onClick={onCreateDocument}
              loading={isCreatingDocument}
              tooltip={isCreatingDocument ? 'Creating Document...' : 'Create Document'}
            />
          )}
        </>
      )}

      {/* More options dropdown (common for all types) */}
      <Dropdown
        menu={{
          items: menuItems,
          disabled: isCreatingDocument,
        }}
        trigger={['click', 'hover']}
        placement="bottomRight"
        overlayClassName="min-w-[160px] w-max"
        getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
        dropdownRender={(menu) => (
          <div className="min-w-[160px] bg-white rounded-lg border-[0.5px] border-[rgba(0,0,0,0.03)] shadow-lg">
            {menu}
          </div>
        )}
      >
        <ActionButton
          icon={<MoreHorizontal className="w-4 h-4" />}
          onClick={(e) => e.preventDefault()}
          tooltip="More Options"
          withTooltip={false}
        />
      </Dropdown>
    </div>
  );
};
