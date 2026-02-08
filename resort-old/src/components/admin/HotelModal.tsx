import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: HotelFormData) => void;
  initialData?: {
    id?: number;
    name: string;
    description: string;
    location: string;
    imageUrl: string;
    floors: number;
  };
}

interface HotelFormData {
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  floors: number;
}

export default function HotelModal({ isOpen, onClose, onSubmit, initialData }: HotelModalProps) {
  const [formData, setFormData] = useState<HotelFormData>({
    name: '',
    description: '',
    location: '',
    imageUrl: '',
    floors: 1
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        floors: initialData.floors || 1  // Ensure floors is a number with fallback
      });
    } else {
      setFormData({
        name: '',
        description: '',
        location: '',
        imageUrl: '',
        floors: 1
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images/hotels');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="w-full max-w-2xl rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: "var(--glass-background)",
          borderColor: "var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            {initialData ? 'Edit Hotel' : 'Add New Hotel'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image
              </label>
              <div className="flex gap-4">
                <select
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                >
                  <option value="">Select an image</option>
                  {images.map((image) => (
                    <option key={image} value={image}>
                      {image.split('/').pop()}
                    </option>
                  ))}
                </select>
                {formData.imageUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700/50">
                    <Image
                      src={formData.imageUrl}
                      alt="Selected image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Floors
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, floors: Math.max(1, Number(prev.floors) - 1) }))}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 min-w-[60px] text-center">
                  {Number(formData.floors)}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, floors: Number(prev.floors) + 1 }))}
                  className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Hotel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 