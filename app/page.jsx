'use client';
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = async (url, videoUrl) => {
  if (!videoUrl) return null; // Prevent unnecessary requests
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: videoUrl }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch video info');
  }

  return res.json();
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  const { data: videoInfo, error, isValidating, mutate } = useSWR(
    url ? ['/api/download', url] : null,
    ([url, videoUrl]) => fetcher(url, videoUrl),
    { revalidateOnFocus: false }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  const handleDownload = async (downloadUrl) => {
    if (downloading) return;
    setDownloading(true);

    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      const form = iframe.contentWindow.document.createElement('form');
      form.method = 'GET';
      form.action = downloadUrl;
      iframe.contentWindow.document.body.appendChild(form);

      form.submit();

      setTimeout(() => {
        document.body.removeChild(iframe);
        setDownloading(false);
      }, 2000);
    } catch (err) {
      console.error('Download failed:', err);
      setDownloading(false);
    }
  };

  function formatFileSize(bytes) {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-black">YouTube Downloader</h1>

        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          <div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              className="w-full p-2 border rounded text-black-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isValidating}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isValidating ? 'Processing...' : 'Process Video'}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-500 text-sm">
            {error.message}
          </div>
        )}

        {videoInfo && (
          <div className="mt-6 space-y-4">
            <div className="aspect-video bg-gray-100 rounded overflow-hidden">
              <img 
                src={videoInfo.thumbnail} 
                alt={videoInfo.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h3 className="font-medium">{videoInfo.title}</h3>
              <p className="text-sm text-gray-500">
                Duration: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Available Qualities:</p>
              {videoInfo.formats.map((format, index) => (
                <button
                  key={index}
                  onClick={() => handleDownload(format.url)}
                  disabled={downloading}
                  className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-400 flex justify-between items-center"
                >
                  <span>{format.qualityLabel} ({format.fps}fps)</span>
                  <span className="text-sm">{formatFileSize(format.size)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
