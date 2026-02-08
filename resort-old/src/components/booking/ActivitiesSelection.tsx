import React from 'react';
import Image from 'next/image';

interface Activity {
  id: number;
  name: string;
  activityType: ActivityType;
  price: number;
  capacity: number | null;
  imageUrl: string;
  isPremium: boolean;
}

type ActivityType = "Beach" | "Theme park" | "Other";

interface ActivitiesSelectionProps {
  activities: Activity[];
  selectedActivities: number[];
  onActivityToggle: (activityId: number) => void;
}

const ActivitiesSelection: React.FC<ActivitiesSelectionProps> = ({
  activities,
  selectedActivities,
  onActivityToggle
}) => {
  return (
    <div>
      <h2 className="text-4xl font-bold text-white mb-8">Activities Selection</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {["Beach", "Theme park", "Other"].map((type) => (
          <div key={type} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              {type === "Beach" && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
              {type === "Theme park" && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
              )}
              {type === "Other" && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              )}
              {type} Activities
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {activities
                .filter(activity => activity.activityType === type)
                .map(activity => (
                  <div 
                    key={activity.id} 
                    className={`relative group rounded-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                      selectedActivities.includes(activity.id)
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-white/5 border-white/10'
                    } border p-4`}
                    onClick={() => onActivityToggle(activity.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative w-16 h-16 rounded-lg bg-gray-800/50 flex-shrink-0 overflow-hidden">
                        <Image
                          src={activity.imageUrl || '/activities.jpg'}
                          alt={activity.name}
                          fill
                          className="object-cover"
                        />
                        {activity.isPremium && (
                          <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-500 rounded-bl-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-white mb-1 truncate">{activity.name}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          {activity.capacity !== null && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {activity.capacity === 0 ? 'Everyone' : activity.capacity}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {activity.price === 0 ? 'Free' : `$${activity.price}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedActivities.includes(activity.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-400'
                        }`}>
                          {selectedActivities.includes(activity.id) && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Total Price Display */}
      <div className="mt-8 p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center text-gray-300">
            <span>Selected Activities:</span>
            <span>{selectedActivities.length} activities</span>
          </div>
          {selectedActivities.map(activityId => {
            const activity = activities.find(a => a.id === activityId);
            return activity ? (
              <div key={activity.id} className="flex justify-between items-center text-gray-300">
                <span>{activity.name}</span>
                <span>{activity.price === 0 ? 'Free' : `$${activity.price}`}</span>
              </div>
            ) : null;
          })}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Total Activities Price:</h3>
              <span className="text-3xl font-bold text-white">
                ${selectedActivities.reduce((total, activityId) => {
                  const activity = activities.find(a => a.id === activityId);
                  return total + (activity?.price || 0);
                }, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesSelection;