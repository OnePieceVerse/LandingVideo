import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG, fetchWithTimeout } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, scenes, settings, userId, taskName } = body;

    // Validate required fields
    if (!url || !scenes || !settings || !userId || !taskName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate scenes have content
    if (!scenes.some((scene: any) => scene.content?.trim())) {
      return NextResponse.json(
        { success: false, error: "At least one scene must have content" },
        { status: 400 }
      );
    }

    // Log the request for debugging
    console.log("Video generation request:", {
      url,
      scenesCount: scenes.length,
      scenes: scenes.map((scene: any) => ({
        id: scene.id,
        content: scene.content,
        assets: scene.assets.map((asset: any) => ({
          type: asset.type,
          suffix: asset.suffix,
          url: asset.url
        }))
      })),
      settings,
      userId
    });

    // Here you would typically:
    // 1. Validate the user is authenticated
    // 2. Save the request to database
    // 3. Queue the video generation job
    // 4. Call external video generation service

    // Prepare payload for remote service
    const remotePayload = {
      user_id: userId,
      task_name: taskName,
      landing_page_url: url,
      scenes: scenes.map((scene: any) => ({
        id: scene.id,
        script: scene.content,
        assets: scene.assets
      })),
      settings: {
        ratio_id: settings.videoRatio,
        voice_id: settings.voice,
        bgm_id: settings.bgm,
        transition_id: settings.transition,
        enhance_assets: settings.enhanceAssets
      }
    };

    try {
      // 使用真实服务时，取消下面的注释并注释掉mock部分
      // const remoteResponse = await fetchWithTimeout(
      //   API_CONFIG.ENDPOINTS.VIDEO_SERVICE,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       // "Authorization": `Bearer ${process.env.VIDEO_SERVICE_API_KEY}`,
      //     },
      //     body: JSON.stringify(remotePayload),
      //   },
      //   API_CONFIG.TIMEOUTS.SUBMIT_TASK_TIMEOUT
      // );

      // if (!remoteResponse.ok) {
      //   throw new Error(`Remote service error: ${remoteResponse.status}`);
      // }

      // const remoteResult = await remoteResponse.json();
      // if (!remoteResult || !remoteResult.code || !remoteResult.data) {
      //   return NextResponse.json(
      //     { success: false, error: "Remote service error" },
      //     { status: 400 }
      //   );
      // }
      // if (remoteResult.code !== 200) {
      //   return NextResponse.json(
      //     { success: false, error: remoteResult.msg },
      //     { status: 400 }
      //   );
      // }

      // const taskId = remoteResult.data.task_id;

      // mock response（当使用真实服务时删除这部分）
      const mockResponse = {
        code: 200,
        msg: "success",
        data: {
          task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }
      };

      return NextResponse.json({
        success: true,
        taskId: mockResponse.data.task_id,
        message: "Your video generation request has been submitted and is being processed."
      });

        } catch (fetchError) {
      // fetchWithTimeout 会自动处理超时错误
      throw fetchError;
    }

  } catch (error) {
    console.error("Video generation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
