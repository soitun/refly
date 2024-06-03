import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton, Message as message } from '@arco-design/web-react';
import { Helmet } from 'react-helmet';

import { useDigestDetailStore } from '@refly-packages/ai-workspace-common/stores/digest-detail';
// utils
import { buildSessionsFromDigest } from '@refly-packages/ai-workspace-common/utils/session';
// 组件
import { DigestDetailContent } from './digest-detail-content';
import { Header } from './header';
import { AskFollowUpModal } from '@refly-packages/ai-workspace-common/components/ask-follow-up-modal/index';
// request
import client from '@refly-packages/ai-workspace-common/requests/proxiedRequest';
// styles
import './digest-detail.scss';
import { Digest } from '@refly-packages/ai-workspace-common/types';
import { useTranslation } from 'react-i18next';

/**
 * 1. same as thread，but only for read
 * 2. if user want to start ask following，then need create a new thread
 *
 */
export const DigestTail = () => {
  const params = useParams<{ digestId: string }>();
  const [askFollowUpVisible, setAskFollowUpVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const digestDetailStore = useDigestDetailStore();
  const { t } = useTranslation();

  const handleGetDetail = async (digestId: string) => {
    setIsFetching(true);
    try {
      const { data: newRes, error } = await client.getContentDetail({
        path: {
          cid: digestId,
        },
      });

      if (error) {
        throw error;
      }
      if (!newRes?.success) {
        throw new Error(newRes?.errMsg);
      }

      console.log('newRes', newRes);
      if (newRes.data) {
        digestDetailStore.updateDigest(newRes?.data);
      }
    } catch (err) {
      message.error(t('contentDetail.list.fetchErr'));
    }

    setIsFetching(false);
  };

  const handleAskFollowUp = () => {
    setAskFollowUpVisible(true);
  };

  useEffect(() => {
    if (params?.digestId) {
      console.log('params', params);
      handleGetDetail(params?.digestId as string);
    }
  }, []);

  const sessions = buildSessionsFromDigest(digestDetailStore?.digest as Digest);

  return (
    <div
      className="digest-detail-container"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Helmet>
        <title>
          {t('productName')} | {digestDetailStore.digest?.title || ''}
        </title>
        <meta name="description" content={digestDetailStore.digest?.abstract} />
      </Helmet>
      <Header digest={digestDetailStore?.digest as Digest} />
      {isFetching ? (
        <div style={{ maxWidth: '748px', width: '748px', margin: '20px auto' }}>
          <Skeleton animation style={{ marginTop: 24 }}></Skeleton>
          <Skeleton animation style={{ marginTop: 24 }}></Skeleton>
          <Skeleton animation style={{ marginTop: 24 }}></Skeleton>
        </div>
      ) : (
        <DigestDetailContent sessions={sessions} handleAskFollowUp={handleAskFollowUp} />
      )}

      {askFollowUpVisible ? (
        <AskFollowUpModal
          visible={askFollowUpVisible}
          setVisible={(visible) => setAskFollowUpVisible(visible)}
          aigcContent={digestDetailStore?.digest as Digest}
        />
      ) : null}
    </div>
  );
};
