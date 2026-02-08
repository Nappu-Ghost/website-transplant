import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/home.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text transform hover:scale-105 transition-transform duration-500">
            Welcome to Paradise
          </h1>
          <p className="text-2xl md:text-3xl mb-12 font-light tracking-wide">
            Experience luxury and adventure on our twin islands
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <a
              href="/booking"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-12 py-4 font-semibold text-black transition duration-300 ease-out hover:scale-105"
            >
              <span className="absolute inset-0 h-full w-full scale-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"></span>
              <span className="relative group-hover:text-white transition-colors duration-300">
                Book Your Stay
              </span>
            </a>
            <a
              href="/accommodations"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-white px-12 py-4 font-semibold text-white transition duration-300 ease-out hover:scale-105"
            >
              <span className="absolute inset-0 h-full w-full scale-0 rounded-full bg-white opacity-0 transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"></span>
              <span className="relative group-hover:text-black transition-colors duration-300">
                Explore Accommodations
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Attractions */}
      <section className="bg-gradient-to-b from-gray-900 to-black py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Featured Attractions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 group"
              >
                <div className="h-64 relative bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
                  <span className="text-gray-400 relative z-20">
                    Image Coming Soon
                  </span>
                </div>
                <div className="p-8 relative z-20">
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-400 text-transparent bg-clip-text">
                    Attraction {i}
                  </h3>
                  <p className="text-gray-300">
                    Experience the magic of our unique attractions.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Events */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Latest News & Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 transition-all duration-500"
              >
                <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400" />
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    Upcoming Event {i}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Join us for an unforgettable experience.
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Learn more
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
