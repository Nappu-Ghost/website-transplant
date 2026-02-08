import React from 'react';

interface BookingInfoProps {
  name: string;
  email: string;
  numberOfPeople: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNumberOfPeopleChange: (increment: boolean) => void;
}

const BookingInfo: React.FC<BookingInfoProps> = ({
  name,
  email,
  numberOfPeople,
  onInputChange,
  onNumberOfPeopleChange
}) => {
  return (
    <div className="space-y-6 bg-blue-400/20 p-6 rounded-xl">
      <h2 className="text-3xl font-bold text-white mb-4">Booking Information</h2>
      <div>
        <label htmlFor="name" className="block text-lg font-medium text-white mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={onInputChange}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your name"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-lg font-medium text-white mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={onInputChange}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label className="block text-lg font-medium text-white mb-2">
          Number of People
        </label>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNumberOfPeopleChange(false)}
            className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl font-bold hover:bg-red-600 transition-colors"
          >
            -
          </button>
          <span className="text-2xl font-bold text-white w-12 text-center">
            {numberOfPeople}
          </span>
          <button
            onClick={() => onNumberOfPeopleChange(true)}
            className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl font-bold hover:bg-green-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingInfo;