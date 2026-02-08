import React from 'react';

interface PremiumPlanCardProps {
  isPremiumPlan: boolean;
  onToggle: () => void;
}

const PremiumPlanCard: React.FC<PremiumPlanCardProps> = ({ isPremiumPlan, onToggle }) => {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-6 rounded-xl flex flex-col justify-between">
      <div>
        <h2 className="text-6xl font-extrabold text-white mb-6">Premium Plan</h2>
        <div className="mb-4">
          <span className="text-5xl font-extrabold text-white">$100</span>
        </div>
        <ul className="space-y-4 mb-8">
          <li className="flex items-start">
            <span className="text-white text-2xl mr-2">•</span>
            <span className="text-white text-xl font-bold">Unlimited Ferry Tickets</span>
          </li>
          <li className="flex items-start">
            <span className="text-white text-2xl mr-2">•</span>
            <span className="text-white text-xl font-bold">Premium Room Selection</span>
          </li>
          <li className="flex items-start">
            <span className="text-white text-2xl mr-2">•</span>
            <span className="text-white text-xl font-bold">Free Room Service</span>
          </li>
          <li className="flex items-start">
            <span className="text-white text-2xl mr-2">•</span>
            <span className="text-white text-xl font-bold">VIP Theme Park Access</span>
          </li>
          <li className="flex items-start">
            <span className="text-white text-2xl mr-2">•</span>
            <span className="text-white text-xl font-bold">Complimentary Spa Treatment</span>
          </li>
          <li className="flex items-start">
            <span className="text-white text-2xl mr-2">•</span>
            <span className="text-white text-xl font-bold">Premium Activities</span>
          </li>
          <li className="flex items-start">
            <span className="text-white text-2xl mr-2">•</span>
            <span className="text-white text-xl font-bold">Priority First Services</span>
          </li>
        </ul>
      </div>
      <button 
        onClick={onToggle}
        className={`w-full ${isPremiumPlan ? 'bg-green-500 hover:bg-green-600' : 'bg-white hover:bg-gray-100'} font-bold py-3 px-6 rounded-lg transition-colors text-lg ${isPremiumPlan ? 'text-white' : 'text-purple-600'}`}
      >
        {isPremiumPlan ? 'Selected' : 'Select Premium Plan'}
      </button>
    </div>
  );
};

export default PremiumPlanCard;