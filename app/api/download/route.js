import ytdl from '@distube/ytdl-core';
import { NextResponse } from 'next/server';

export async function POST(req) {
  console.log('API /download endpoint hit');

  try {
    const { url } = await req.json();

    if (!url || !ytdl.validateURL(url)) {
      console.error('Invalid URL provided:', url);
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Get video info with a custom User-Agent header.
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      }
    });

    // Filter and map available formats.
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
        // Sort descending based on numerical quality.
        const qualityA = parseInt(a.qualityLabel) || 0;
        const qualityB = parseInt(b.qualityLabel) || 0;
        return qualityB - qualityA;
      });

    return NextResponse.json({
      formats,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0]?.url || '',
      duration: info.videoDetails.lengthSeconds
    });

  } catch (error) {
    console.error('Error in /api/download:', error);
    return NextResponse.json({ error: 'Failed to get video info' }, { status: 500 });
  }
}
