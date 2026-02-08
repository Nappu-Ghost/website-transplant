"use client";

interface FerryTicketsProps {
  tickets: number;
  onTicketsChange: (increment: boolean) => void;
  isPremium: boolean;
  numberOfPeople: number;
}

export default function FerryTickets({ tickets, onTicketsChange, isPremium }: FerryTicketsProps) {
  const TICKET_PRICE = 1;
  const totalPrice = isPremium ? 0 : tickets * TICKET_PRICE;

  return (
    <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/20 text-purple-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </span>
          <div>
            <h4 className="text-2xl font-semibold text-white">Ferry Tickets</h4>
            <p className="text-gray-300">Round-trip transfer to Theme Park Island</p>
          </div>
        </div>
        {isPremium ? (
          <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <span className="text-purple-300 font-semibold">Premium Plan: Free Unlimited Tickets</span>
          </div>
        ) : (
          <span className="text-blue-400 text-xl">${TICKET_PRICE}/ticket</span>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-6 p-4 bg-white/5 rounded-lg">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onTicketsChange(false)}
            disabled={tickets === 0}
            className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="text-white text-2xl font-semibold">{tickets}</span>
          <button
            onClick={() => onTicketsChange(true)}
            className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600"
          >
            +
          </button>
        </div>
        
        <div className="text-right">
          <div className="text-gray-300 mb-1">Total Price</div>
          <div className="text-2xl font-bold text-white">${totalPrice}</div>
        </div>
      </div>
    </div>
  );
}