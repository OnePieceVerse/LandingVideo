import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Log the crawl request to Supabase (optional)
    await supabase.from('crawl_requests').insert({
      url,
      status: 'processing',
    });

    // In a real application, you would:
    // 1. Fetch the content from the URL
    // 2. Parse the HTML
    // 3. Extract relevant content
    // 4. Process it for video generation

    // For this example, we'll simulate the crawl with a delay
    // and return some mock data
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock response data
    const mockParagraphs = [
      {
        id: 1,
        content: `Content extracted from ${url} for scene 1. This would be the main headline or introduction from the landing page.`,
        assets: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000' },
          { type: 'video', url: 'https://static.videezy.com/system/resources/previews/000/005/529/original/Reaviling_Sjusj%C3%B8en_Ski_Senter.mp4' }
        ]
      },
      {
        id: 2,
        content: `Content extracted from ${url} for scene 2. This would typically be a feature description or benefit statement from the landing page.`,
        assets: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1000' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000' }
        ]
      },
      {
        id: 3,
        content: `Content extracted from ${url} for scene 3. This would be a call to action or conclusion from the landing page.`,
        assets: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000' }
        ]
      }
    ];

    // Update the crawl request status in Supabase (optional)
    await supabase.from('crawl_requests').update({
      status: 'completed',
    }).eq('url', url);

    // Return the response
    return NextResponse.json({
      success: true,
      message: 'Landing page crawled successfully',
      url,
      paragraphs: mockParagraphs,
    });
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
}
