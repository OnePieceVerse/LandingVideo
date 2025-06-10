import { NextResponse } from 'next/server';
import { API_CONFIG, fetchWithTimeout } from '@/lib/config';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // 使用配置的超时时间进行请求
    const apiResponse = await fetchWithTimeout(
      API_CONFIG.ENDPOINTS.CRAWL_SERVICE,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${process.env.LANDINGVIDEO_API_KEY || ''}`, // Using server environment variable for API key
        },
        body: JSON.stringify({ url }),
      },
      API_CONFIG.TIMEOUTS.CRAWL_TIMEOUT
    );

    if (!apiResponse.ok) {
      throw new Error(`Third-party API error: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();

    // If we have real data from the API, use it
    if (apiData && apiData.code === 200 && apiData.data) {
      // generate asset type and suffix
      let id = 0;
      const scenes = apiData.data.map((scene: any) => {
        id++;
        return {
          id: id,
          content: scene.text,
          assets: scene.materials.length > 0 ? scene.materials.map((material: string) => {  // scene.materials is list of string, each string is a url
            const suffix = getAssetSuffix(material);
            const type = getAssetType(suffix);
            return {
              type: type,
              suffix: suffix,
              url: material,
            };
          }) : [],
        };
      });

      // Return the API response
      return NextResponse.json({
        success: true,
        message: 'Landing page crawled successfully',
        url,
        scenes: scenes,
      });
    }
    else {
      return NextResponse.json({ error: 'Failed to crawl URL' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error crawling URL:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to crawl URL'
      },
      { status: 500 }
    );
  }
};

const getAssetSuffix = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

const getAssetType = (suffix: string): string => {
  if (suffix.startsWith('gif')) {
    return 'gif';
  } else if (suffix.startsWith('jpg') || suffix.startsWith('jpeg') || suffix.startsWith('png')) {
    return 'image';
  } else if (suffix.startsWith('mp4') || suffix.startsWith('wav')) {
    return 'video';
  } else {
    return 'image'; // default fallback
  }
};
