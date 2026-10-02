import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, AlertCircle, Camera } from 'lucide-react';

export default function ImageUploader({ files, setFiles, maxFiles = 5 }) {
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError('');
    const selectedFiles = Array.from(e.target.files);

    if (files.length + selectedFiles.length > maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} media files.`);
      return;
    }

    const validated = [];
    for (const file of selectedFiles) {
      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 25MB file size limit.`);
        continue;
      }

      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        setError(`"${file.name}" is not a supported image or video format.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      validated.push({
        file,
        previewUrl,
        type: isVideo ? 'video' : 'image',
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1),
      });
    }

    setFiles((prev) => [...prev, ...validated]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const target = prev[index];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Media Evidence (Photos & Video)
        </label>
        <span className="text-xs text-slate-500 font-medium">
          {files.length}/{maxFiles} attached
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-blue-50/20 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800">
          Click to upload photos or optional video
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supports JPEG, PNG, WEBP, and MP4 (up to 25MB each)
        </p>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {files.map((item, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center shadow-xs"
            >
              {item.type === 'video' ? (
                <video
                  src={item.previewUrl}
                  className="w-full h-full object-cover opacity-85"
                />
              ) : (
                <img
                  src={item.previewUrl}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs">
                {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                <span>{item.size} MB</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                aria-label="Remove media"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
