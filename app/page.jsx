'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setVideoInfo(data);
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;
    
    try {
      // Fetch the video as blob
      const response = await fetch(videoInfo.url);
      const blob = await response.blob();
      
      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${videoInfo.title}.mp4`; // This forces download instead of playing
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError('Download failed. Please try again.');
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
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Process Video'}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-500 text-sm">
            {error}
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
            </div>

            <button
              onClick={handleDownload}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Download Video
            </button>
          </div>
        )}
      </div>
    </main>
  );
}