// app/page.jsx
'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);

  // URL validation
  const isValidUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return youtubeRegex.test(url);
  };

  // Determine API URL based on environment
  const apiUrl =
    process.env.NODE_ENV === 'production'
      ? `${process.env.NEXT_PUBLIC_VERCEL_URL || 'https://your-vercel-domain.vercel.app'}/api/download`
      : '/api/download';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoInfo(null);

    if (!isValidUrl(url)) {
      setError('Please enter a valid YouTube URL');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      setVideoInfo(data);
    } catch (err) {
      console.error('Frontend fetch error:', err);
      setError(err.message || 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;

    try {
      setLoading(true);
      const response = await fetch(videoInfo.url);
      if (!response.ok) {
        throw new Error('Failed to fetch video file');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${videoInfo.title}.mp4`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      setError('Download failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">YouTube Downloader</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Processing...' : 'Process Video'}
          </button>
        </form>

        {loading && (
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500 text-sm">{error}</div>
        )}

        {videoInfo && !loading && (
          <div className="mt-6 space-y-4">
            <div className="aspect-video bg-gray-100 rounded overflow-hidden">
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="font-medium text-gray-800">{videoInfo.title}</h3>
            </div>

            <button
              onClick={handleDownload}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Download Video
            </button>
          </div>
        )}
      </div>
    </main>
  );
}