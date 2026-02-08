import { useState, useEffect } from "react";
import { Activity, ActivityType } from "@/types/activity";
import Image from "next/image";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Activity, "id" | "createdAt" | "updatedAt">) => void;
  initialData?: Activity;
}

const ActivityModal = ({ isOpen, onClose, onSubmit, initialData }: ActivityModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    activityType: "Beach" as ActivityType,
    price: 0,
    capacity: 0,
    imageUrl: "",
    isPremium: false,
  });
  const [activityImages, setActivityImages] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        activityType: initialData.activityType || "Beach",
        price: initialData.price || 0,
        capacity: initialData.capacity || 0,
        imageUrl: initialData.imageUrl || "",
        isPremium: initialData.isPremium || false,
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      fetchActivityImages();
    }
  }, [isOpen]);

  const fetchActivityImages = async () => {
    try {
      const response = await fetch('/api/images/activities');
      const data = await response.json();
      setActivityImages(data);
    } catch (error) {
      console.error('Failed to fetch activity images:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl border border-gray-800 shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {initialData ? "Edit Activity" : "Add New Activity"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Activity Type
                </label>
                <select
                  value={formData.activityType}
                  onChange={(e) =>
                    setFormData({ ...formData, activityType: e.target.value as ActivityType })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Beach">Beach</option>
                  <option value="Theme park">Theme park</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Price {formData.price === 0 ? "(Free)" : ""}
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Capacity {formData.capacity === 0 ? "(Everyone)" : ""}
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Activity Icon (SVG)
                </label>
                <div className="flex gap-4">
                  <select
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select an icon</option>
                    {activityImages.map((image) => (
                      <option key={image} value={image}>
                        {image.split('/').pop()}
                      </option>
                    ))}
                  </select>
                  {formData.imageUrl && (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-700">
                      <Image
                        src={formData.imageUrl}
                        alt="Activity icon"
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) =>
                    setFormData({ ...formData, isPremium: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 bg-gray-800 border-gray-700"
                />
                <label htmlFor="isPremium" className="ml-2 text-gray-400">
                  Premium Activity
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {initialData ? "Update Activity" : "Create Activity"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;