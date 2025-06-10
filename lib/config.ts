// API 配置文件
export const API_CONFIG = {
  // 超时设置（毫秒）
  TIMEOUTS: {
    // 爬取页面内容的超时时间
    CRAWL_TIMEOUT: 60000, // 60秒

    // 视频生成任务的超时时间
    SUBMIT_TASK_TIMEOUT: 3000, // 3秒

    // 文件上传的超时时间
    UPLOAD_TIMEOUT: 30000, // 30秒

    // 默认超时时间
    DEFAULT_TIMEOUT: 3000, // 3秒
  },

  // API 端点配置
  ENDPOINTS: {
    CRAWL_SERVICE: 'http://localhost:8008/api/v1/text/urlCrawl',
    VIDEO_SERVICE: 'http://localhost:8088/api/v1/task/submit_task',
  }
};

// 创建带超时的 fetch 函数
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = API_CONFIG.TIMEOUTS.DEFAULT_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs / 1000} seconds`);
    }

    throw error;
  }
};
