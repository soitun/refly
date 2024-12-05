import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Divider, Steps } from 'antd';
import { useActionResultStoreShallow } from '@refly-packages/ai-workspace-common/stores/action-result';
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';
import { ActionResult } from '@refly/openapi-schema';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { IconCheckCircle } from '@arco-design/web-react/icon';
import { cn } from '@refly-packages/utils/cn';
import { actionEmitter } from '@refly-packages/ai-workspace-common/events/action';
import { ActionStepCard } from './action-step';
import { convertContextToItems } from '@refly-packages/ai-workspace-common/utils/map-context-items';

import { PreviewChatInput } from './preview-chat-input';
import { ChatHistory } from '@refly-packages/ai-workspace-common/components/canvas/launchpad/chat-history';

import './index.scss';
import { SourceListModal } from '@refly-packages/ai-workspace-common/components/source-list/source-list-modal';
import { useKnowledgeBaseStore } from '@refly-packages/ai-workspace-common/stores/knowledge-base';
import { NodeItem } from '@refly-packages/ai-workspace-common/stores/context-panel';
import { useCanvasControl } from '@refly-packages/ai-workspace-common/hooks/use-canvas-control';
interface SkillResponseNodePreviewProps {
  resultId: string;
}

export const SkillResponseNodePreview = ({ resultId }: SkillResponseNodePreviewProps) => {
  const { t } = useTranslation();
  const { result, updateActionResult } = useActionResultStoreShallow((state) => ({
    result: state.resultMap[resultId],
    updateActionResult: state.updateActionResult,
  }));
  const knowledgeBaseStore = useKnowledgeBaseStore((state) => ({
    sourceListDrawerVisible: state.sourceListDrawer.visible,
  }));
  const [logBoxCollapsed, setLogBoxCollapsed] = useState(false);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);

  const { addSelectedNodeByEntity } = useCanvasControl();

  const fetchActionResult = async (resultId: string) => {
    const { data, error } = await getClient().getActionResult({
      query: { resultId },
    });

    if (error || !data?.success) {
      return;
    }

    updateActionResult(resultId, data.data);
  };

  useEffect(() => {
    if (!result) {
      fetchActionResult(resultId);
    }
  }, [resultId]);

  const scrollToBottom = (event: { resultId: string; payload: ActionResult }) => {
    if (event.resultId !== resultId || event.payload.status !== 'executing') {
      return;
    }

    const container = document.body.querySelector('.preview-container');
    if (container) {
      const { scrollHeight, clientHeight } = container;
      container.scroll({
        behavior: 'smooth',
        top: scrollHeight - clientHeight + 50,
      });
    }
  };

  useEffect(() => {
    actionEmitter.on('updateResult', scrollToBottom);
    return () => {
      actionEmitter.off('updateResult', scrollToBottom);
    };
  }, []);

  useEffect(() => {
    if (result?.status === 'finish') {
      setLogBoxCollapsed(true);
    } else if (result?.status === 'executing') {
      setLogBoxCollapsed(false);
    }
  }, [result?.status]);

  const { title, steps = [], context, history = [], actionMeta, logs } = result ?? {};
  const contextItems = convertContextToItems(context);

  const historyItems = history.map((item) => ({
    id: item.resultId,
    position: { x: 0, y: 0 },
    data: {
      entityId: item.resultId,
      contentPreview: item.steps?.map((step) => step.content)?.join('\n\n'),
      title: item.title,
    },
  }));

  const handleItemClick = (item: NodeItem) => {
    addSelectedNodeByEntity({ type: 'skillResponse', entityId: item.data.entityId });
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="ai-copilot-operation-container readonly">
        <div className="ai-copilot-operation-body">
          <ChatHistory
            readonly
            isOpen={chatHistoryOpen}
            onClose={() => setChatHistoryOpen(false)}
            onItemClick={(item) => handleItemClick(item)}
            items={historyItems}
          />
          <PreviewChatInput
            readonly
            contextItems={contextItems}
            historyItems={historyItems}
            chatHistoryOpen={chatHistoryOpen}
            setChatHistoryOpen={setChatHistoryOpen}
            query={title}
            actionMeta={actionMeta}
          />
        </div>
      </div>

      {result?.logs?.length > 0 && (
        <div
          className={cn('p-4 border border-solid border-gray-200 rounded-lg transition-all', {
            'px-4 py-2 cursor-pointer hover:bg-gray-50': logBoxCollapsed,
            'relative pb-0': !logBoxCollapsed,
          })}
        >
          {logBoxCollapsed ? (
            <div
              className="text-gray-500 text-sm flex items-center justify-between"
              onClick={() => setLogBoxCollapsed(false)}
            >
              <div>
                <IconCheckCircle /> {t('canvas.skillResponse.skillCompleted')}
              </div>
              <div className="flex items-center">
                <ChevronDown className="w-6 h-6" />
              </div>
            </div>
          ) : (
            <>
              <Steps
                direction="vertical"
                current={logs?.length ?? 0}
                size="small"
                items={logs?.map((log, index) => ({
                  title: log,
                  description: 'This is a description.',
                }))}
              />
              <Button
                type="text"
                icon={<ChevronUp />}
                onClick={() => setLogBoxCollapsed(true)}
                className="absolute right-2 top-2"
              />
            </>
          )}
        </div>
      )}

      {steps?.map((step, index) => (
        <div key={index}>
          <ActionStepCard result={result} step={step} index={index + 1} query={title} />
        </div>
      ))}

      {knowledgeBaseStore?.sourceListDrawerVisible ? <SourceListModal classNames="source-list-modal" /> : null}
    </div>
  );
};
