export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* History Section */}
        <section className="mb-16 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            Our History
          </h2>
          <p className="text-lg text-gray-900 dark:text-gray-100 mb-6">
            Founded in 2010, our island resort has grown from a modest getaway
            destination to a world-class twin-island resort complex. What
            started as a vision to create the perfect balance between relaxation
            and adventure has evolved into a unique destination that offers both
            serene beaches and thrilling entertainment.
          </p>
          <p className="text-lg text-gray-900 dark:text-gray-100">
            Over the years, we've expanded our facilities, added the theme park
            island, and continuously enhanced our guest experience while
            maintaining our commitment to environmental sustainability and local
            community development.
          </p>
        </section>

        {/* Mission and Vision Section */}
        <section className="mb-16 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                Our Mission
              </h2>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                To create unforgettable experiences that combine luxury,
                adventure, and sustainability, while providing exceptional
                service that exceeds our guests' expectations and preserves our
                natural environment for future generations.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                Our Vision
              </h2>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                To be the world's leading sustainable island resort destination,
                setting new standards in hospitality, entertainment, and
                environmental stewardship while creating lasting memories for
                our guests.
              </p>
            </div>
          </div>
        </section>

        {/* Sustainability Section */}
        <section className="mb-16 bg-emerald-900/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-emerald-500/20">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            Sustainability Initiatives
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold mb-4 text-emerald-400">
                Renewable Energy
              </h3>
              <p className="text-gray-300">
                Our resort is powered by 80% solar and wind energy, reducing our
                carbon footprint significantly.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold mb-4 text-emerald-400">
                Marine Conservation
              </h3>
              <p className="text-gray-300">
                We actively participate in coral reef restoration and marine
                life protection programs.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold mb-4 text-emerald-400">
                Waste Management
              </h3>
              <p className="text-gray-300">
                Zero-waste initiatives and comprehensive recycling programs
                across both islands.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Team Member 1 */}
            <div className="text-center bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-48 h-48 mx-auto bg-gray-700 rounded-full mb-4 ring-2 ring-white/20" />{" "}
              {/* Placeholder for profile image */}
              <h3 className="text-xl font-semibold mb-2 text-white">
                Naflah Mohamed
              </h3>
              <p className="text-blue-400 mb-3">Frontend Lead</p>
              <p className="text-gray-300">
                Leads frontend development, system development implementation, connects backend 
                to frontend, and serves as the overall site designer.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-48 h-48 mx-auto bg-gray-700 rounded-full mb-4 ring-2 ring-white/20" />{" "}
              {/* Placeholder for profile image */}
              <h3 className="text-xl font-semibold mb-2 text-white">
                Ahmed Fauzan Fawwaz
              </h3>
              <p className="text-blue-400 mb-3">Backend Developer</p>
              <p className="text-gray-300">
                Manages backend infrastructure, implements and maintains database systems, 
                and sets up API endpoints for efficient data handling.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-48 h-48 mx-auto bg-gray-700 rounded-full mb-4 ring-2 ring-white/20" />{" "}
              {/* Placeholder for profile image */}
              <h3 className="text-xl font-semibold mb-2 text-white">
                Zuhal Rifau
              </h3>
              <p className="text-blue-400 mb-3">Project Manager</p>
              <p className="text-gray-300">
                Oversees project management using Trello Board and contributes valuable 
                design ideas and suggestions for the overall user experience.
              </p>
            </div>

            {/* Team Member 4 */}
            <div className="text-center bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="w-48 h-48 mx-auto bg-gray-700 rounded-full mb-4 ring-2 ring-white/20" />{" "}
              {/* Placeholder for profile image */}
              <h3 className="text-xl font-semibold mb-2 text-white">
                Mohamed Razaan
              </h3>
              <p className="text-blue-400 mb-3">QA Engineer</p>
              <p className="text-gray-300">
                Conducts comprehensive testing, develops CI/CD pipeline, and ensures all 
                system components work correctly together.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
