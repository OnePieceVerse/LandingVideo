import { NextRequest, NextResponse } from "next/server";

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

    // For now, we'll simulate calling a remote service
    // Replace this with your actual video generation service endpoint
    const REMOTE_SERVICE_URL = "http://localhost:8088/v1/api/task/submit_task";

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

    // // request to real service
    // const remoteResponse = await fetch(REMOTE_SERVICE_URL, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     // "Authorization": `Bearer ${process.env.VIDEO_SERVICE_API_KEY}`,
    //   },
    //   body: JSON.stringify(remotePayload),
    // });

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


    // mock response
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
