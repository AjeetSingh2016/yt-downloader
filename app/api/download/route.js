// app/api/download/route.js
import ytdl from '@distube/ytdl-core';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { url } = await req.json();
    
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      }
    });
    
    // Filter formats to get only those with both video and audio
    const formats = info.formats
      .filter(format => format.hasVideo && format.hasAudio)
      .map(format => ({
        url: format.url,
        qualityLabel: format.qualityLabel,
        container: format.container,
        fps: format.fps,
        size: format.contentLength
      }))
      .sort((a, b) => {
        // Extract numeric value from qualityLabel (e.g., "720p" -> 720)
        const qualityA = parseInt(a.qualityLabel);
        const qualityB = parseInt(b.qualityLabel);
        return qualityB - qualityA;
      });

    return NextResponse.json({
      formats,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      duration: info.videoDetails.lengthSeconds
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to get video info' }, { status: 500 });
  }
}