import { NextResponse } from 'next/server';

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

    // Forward the request to the third-party service
    const apiResponse = await fetch('http://localhost:8008/api/v1/text/urlCrawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${process.env.LANDINGVIDEO_API_KEY || ''}`, // Using server environment variable for API key
      },
      body: JSON.stringify({ url }),
    });

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
          content: scene.content,
          assets: scene.materials.map((material: string) => {  // scene.materials is list of string, each string is a url
            const suffix = getAssetSuffix(material);
            const type = getAssetType(suffix);
            return {
              type: type,
              suffix: suffix,
              url: material,
            };
          }),
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

    // // Fallback to mock data if the API doesn't return scenes
    // const mockscenes = [
    //   {
    //     id: 1,
    //     content: `Content extracted from ${url} for scene 1. This would be the main headline or introduction from the landing page.`,
    //     assets: [
    //       { type: 'image', suffix: 'jpg', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000' },
    //       { type: 'video', suffix: 'mp4', url: 'https://static.videezy.com/system/resources/previews/000/005/529/original/Reaviling_Sjusj%C3%B8en_Ski_Senter.mp4' }
    //     ]
    //   },
    //   {
    //     id: 2,
    //     content: `Content extracted from ${url} for scene 2. This would typically be a feature description or benefit statement from the landing page.`,
    //     assets: [
    //       { type: 'image', suffix: 'jpg', url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1000' },
    //       { type: 'video', suffix: 'jpeg', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000' }
    //     ]
    //   },
    //   {
    //     id: 3,
    //     content: `Content extracted from ${url} for scene 3. This would be a call to action or conclusion from the landing page.`,
    //     assets: [
    //       { type: 'image', suffix: 'jpg', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000' }
    //     ]
    //   }
    // ];
    // // Return the response
    // return NextResponse.json({
    //   success: true,
    //   message: 'Landing page crawled successfully',
    //   url,
    //   scenes: mockscenes,
    // });

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
