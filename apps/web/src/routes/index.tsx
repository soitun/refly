import React, { useEffect } from "react"
import { Route, Routes, useMatch } from "react-router-dom"

// 自定义组件
import { Thread } from "@refly/ai-workspace-common/components/thread-item/thread"
import { ConvLibrary } from "@/pages/conv-library"
import { Settings } from "@refly/ai-workspace-common/components/settings/index"
import { Login } from "@refly/ai-workspace-common/components/login/index"
import { DigestToday } from "@/pages/digest-today"
import { DigestTopics } from "@/pages/digest-topics/index"
import { DigestTopicDetail } from "@/pages/digest-topic-detail/index"
import { DigestArchive } from "@/pages/digest-timeline"

// digest 详情
import { DigestDetailPage } from "@/pages/digest-detail"
// 页面
import Workspace from "@/pages/workspace"
import KnowledgeBase from "@/pages/knowledge-base"
import Skill from "@/pages/skill"
import SkillDetailPage from "@/pages/skill-detail"

// 这里用于分享之后的不需要鉴权的查看
import { AIGCContentDetailPage } from "@/pages/aigc-content-detail"
import { safeParseJSON } from "@refly/ai-workspace-common/utils/parse"
import { useUserStore } from "@refly/ai-workspace-common/stores/user"
import { useTranslation } from "react-i18next"
import { useGetUserSettings } from "@refly/ai-workspace-common/hooks/use-get-user-settings"
import { LOCALE } from "@refly/common-types"
import { Spin } from "@arco-design/web-react"

export const AppRouter = (props: { layout?: any }) => {
  const { layout: Layout } = props
  const userStore = useUserStore()

  const { i18n } = useTranslation()
  const language = i18n.languages?.[0]

  // 获取 storage user profile
  const storageUserProfile = safeParseJSON(
    localStorage.getItem("refly-user-profile"),
  )
  const notShowLoginBtn = storageUserProfile?.uid || userStore?.userProfile?.uid

  // 获取 locale
  const storageLocalSettings = safeParseJSON(
    localStorage.getItem("refly-local-settings"),
  )
  const locale =
    storageLocalSettings?.uiLocale ||
    userStore?.localSettings?.uiLocale ||
    LOCALE.EN

  // 这里进行用户登录信息检查
  useGetUserSettings()

  // TODO: 国际化相关内容
  useEffect(() => {
    if (locale && language !== locale) {
      i18n.changeLanguage(locale)
    }
  }, [locale])

  if (!notShowLoginBtn) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Spin />
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/feed" element={<Feed />} /> */}
        <Route path="/digest" element={<DigestToday />} />
        <Route path="/digest/topics" element={<DigestTopics />} />
        <Route path="/content/:digestId" element={<AIGCContentDetailPage />} />
        <Route path="/digest/:digestId" element={<DigestDetailPage />} />
        {/* <Route path="/feed/:feedId" element={<FeedDetailPage />} /> */}
        <Route
          path="/digest/topic/:digestTopicId"
          element={<DigestTopicDetail />}
        />
        <Route path="/thread/:threadId" element={<Thread />} />
        <Route path="/thread" element={<ConvLibrary />} />
        <Route path="/skill" element={<Skill />} />
        <Route path="/skill-detail" element={<SkillDetailPage />} />
        <Route path="/settings" element={<Settings />} />
        {/** dateType: daily/weekly/monthly/yearly */}
        <Route
          path="/digest/:dateType/:year/:month/:day"
          element={<DigestArchive />}
        />
      </Routes>
    </Layout>
  )
}
