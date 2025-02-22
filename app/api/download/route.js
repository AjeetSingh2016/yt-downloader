// app/api/download/route.js
import ytdl from '@distube/ytdl-core';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { url } = await req.json();
    
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const info = await ytdl.getInfo(url);
    
    const format = ytdl.chooseFormat(info.formats, { 
      quality: 'highest',
      filter: format => format.container === 'mp4' && format.hasAudio && format.hasVideo
    });

    // Add Content-Disposition to force download
    return NextResponse.json({
      url: format.url,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      contentType: format.mimeType,
      contentLength: format.contentLength
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}