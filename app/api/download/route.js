// app/api/download/route.js
import ytdl from '@distube/ytdl-core';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { url } = await req.json();
    console.log('Processing URL:', url); // Log for debugging on Vercel

    // Validate URL
    if (!url || typeof url !== 'string' || !ytdl.validateURL(url)) {
      console.log('Invalid URL detected:', url);
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // Fetch video info
    console.log('Fetching video info...');
    const info = await ytdl.getInfo(url);
    console.log('Video info fetched:', info.videoDetails.title);

    // Check if video details exist
    if (!info?.videoDetails) {
      console.log('No video details found');
      return NextResponse.json({ error: 'Unable to fetch video details' }, { status: 400 });
    }

    // Choose format
    const format = ytdl.chooseFormat(info.formats, {
      quality: 'highest',
      filter: (format) => format.container === 'mp4' && format.hasAudio && format.hasVideo,
    });

    if (!format) {
      console.log('No suitable format found');
      return NextResponse.json({ error: 'No suitable video format found' }, { status: 400 });
    }

    // Return metadata
    return NextResponse.json({
      url: format.url,
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      contentType: format.mimeType,
      contentLength: format.contentLength,
    });

  } catch (error) {
    console.error('Error in API route:', error.message, error.stack); // Detailed logging
    return NextResponse.json(
      { error: 'Download failed: ' + error.message },
      { status: 500 }
    );
  }
}

export const config = {
  runtime: 'nodejs', // Ensure Node.js runtime for Vercel
};