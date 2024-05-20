export const appConfig = {
  currentPage: {},
  operation: {},
  side: {
    Right: "right",
    Left: "left",
  },
  url: {
    // 先临时写在这里，后续会替换
    deleteConversation: "/api/conversation/deleteConversation",
    updateConversation: "/api/conversation/updateConversation",
    getChatItemList: "/api/chat/getChatItemList",
    generateAnswer: "/api/generate/gen",
    generateTitle: "/api/generate/gen-title",
    syncChatItems: "/api/task/syncChatItems",
    createNewConversation: "/v1/conversation/new",
    getThreadMessages: (threadId: string) => `/v1/conversation/${threadId}`,
    storeWeblink: "/v1/weblink/store",
    getWeblinkList: "/v1/weblink/list",
    getWeblinkIndexStatus: "/v1/weblink/list", // 与 weblink 共享
    getConversationList: "/v1/conversation/list",
    getTopicList: "/v1/user/topics",
    getUserInfo: "/v1/auth/getUserInfo",
    userSettings: "/v1/user/settings", // Support get/put
    getTopicDetail: (topicId: string) => `/v1/topic/${topicId}`,
    getDigestList: `/v1/aigc/digest`,
    getAIGCContent: (contentId: string) => `/v1/aigc/content/${contentId}`,
    getSourceSummary: (sourceId: string) => `/v1/weblink/${sourceId}/summary`,
    getFeedList: `/v1/aigc/feed`,
    getKnowledgeBaseList: "/v1/knowledge/collection/list",
    newKnowledgeBase: "/v1/knowledge/collection/new",
    updateKnowledgeBase: "/v1/knowledge/collection/update",
    deleteKnowledgeBase: "/v1/knowledge/collection/delete",
    getKnowledgeBaseDetail: "/v1/knowledge/collection/detail",
    getKnowledgeBaseResourceList: "/v1/knowledge/resource/list",
    getResourceDetail: "/v1/knowledge/resource/detail",
    newResource: "/v1/knowledge/resource/new",
    deleteResource: "/v1/knowledge/resource/delete",
    updateResource: "/v1/knowledge/resource/update",
  },
  domId: {},
  appInfo: {
    WebUrl: "webUrl",
    ShowedPauseTip: "showedPauseTip",
    HighlighterColor: "highlighterColor",
    LastViewedAnnouncement: "lastViewedAnnouncement",
    IsDeveloper: "isDeveloper",
  },
  uiInfo: {},
  errInfo: [
    "Error: This request exceeds the MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND quota.",
    "The message port closed before a response was received.",
    "Could not establish connection. Receiving end does not exist.",
    "Extension context invalidated.",
    "The browser is shutting down.",
    "ResizeObserver loop limit exceeded",
    "Cannot access contents of the page.",
    "No tab with id:",
  ],
}

export type REQUEST_URL_TYPE = keyof typeof appConfig.url
