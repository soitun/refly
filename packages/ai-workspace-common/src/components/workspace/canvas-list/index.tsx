import { useEffect } from 'react';
import { time } from '@refly-packages/ai-workspace-common/utils/time';
import { useTranslation } from 'react-i18next';

import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';

import { Canvas } from '@refly/openapi-schema';
import { List, Empty } from '@arco-design/web-react';
import { IconBook } from '@arco-design/web-react/icon';
import { CanvasCard } from '@refly-packages/ai-workspace-common/components/workspace/canvas-list/canvas-card';
import { ScrollLoading } from '../scroll-loading';
import { useKnowledgeBaseJumpNewPath } from '@refly-packages/ai-workspace-common/hooks/use-jump-new-path';
import { useCanvasTabs } from '@refly-packages/ai-workspace-common/hooks/use-canvas-tabs';
import { DeleteDropdownMenu } from '@refly-packages/ai-workspace-common/components/knowledge-base/delete-dropdown-menu';
import { useFetchDataList } from '@refly-packages/ai-workspace-common/hooks/use-fetch-data-list';

import { LOCALE } from '@refly/common-types';
import './index.scss';

interface CanvasListProps {
  listGrid?: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export const CanvasList = (props: CanvasListProps) => {
  const { listGrid } = props;
  const { i18n } = useTranslation();
  const language = i18n.languages?.[0];

  const { dataList, setDataList, loadMore, hasMore, isRequesting } = useFetchDataList({
    fetchData: async (queryPayload) => {
      const res = await getClient().listCanvas({
        query: queryPayload,
      });
      return res?.data;
    },
    pageSize: 12,
  });

  useEffect(() => {
    loadMore();
  }, []);

  const { jumpToCanvas } = useKnowledgeBaseJumpNewPath();
  const { handleAddTab: handleAddCanvasTab } = useCanvasTabs();

  if (dataList.length === 0 && !isRequesting) {
    return <Empty />;
  }

  const handleClickCanvas = (canvas: Canvas) => {
    jumpToCanvas({ canvasId: canvas.canvasId, projectId: canvas.projectId });
    handleAddCanvasTab({
      title: canvas.title,
      key: canvas.canvasId,
      content: canvas.contentPreview || '',
      canvasId: canvas.canvasId,
      projectId: canvas.projectId,
    });
  };

  return (
    <List
      grid={
        listGrid || {
          sm: 24,
          md: 12,
          lg: 8,
          xl: 6,
        }
      }
      className="workspace-list canvas-list"
      wrapperStyle={{ width: '100%' }}
      bordered={false}
      pagination={false}
      dataSource={dataList}
      scrollLoading={<ScrollLoading isRequesting={isRequesting} hasMore={hasMore} loadMore={loadMore} />}
      render={(item: Canvas, key) => (
        <List.Item
          key={item?.canvasId + key}
          style={{
            padding: '0',
            width: '100%',
          }}
          className="knowledge-base-list-item-container"
          actionLayout="vertical"
          actions={[
            <CanvasCard
              cardData={item}
              index={key}
              cardIcon={<IconBook style={{ fontSize: '32px', strokeWidth: 3 }} />}
              onClick={() => handleClickCanvas(item)}
            >
              <div className="flex justify-between items-center mt-6">
                <div className="text-xs text-black/40">
                  {time(item.updatedAt, language as LOCALE)
                    .utc()
                    .fromNow()}
                </div>
                <div className="flex items-center">
                  <DeleteDropdownMenu
                    type="canvas"
                    data={item}
                    postDeleteList={(canvas: Canvas) =>
                      setDataList(dataList.filter((n) => n.canvasId !== canvas.canvasId))
                    }
                    getPopupContainer={() => document.getElementById(`canvas-${key}`) as HTMLElement}
                  />
                </div>
              </div>
            </CanvasCard>,
          ]}
        ></List.Item>
      )}
    />
  );
};
