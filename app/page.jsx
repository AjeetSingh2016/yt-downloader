// app/page.js
'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);

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
      setError(err.message || 'Failed to get video info');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadUrl) => {
    if (downloading) return;
  
    setDownloading(true);
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
  
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Cleanup the Blob URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      setError('Download failed. Please try again.');
    } finally {
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