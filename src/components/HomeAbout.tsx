import React from 'react';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomeAbout = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 transform ${
            inView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Our Church
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A place where faith, community, and love come together
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Our History
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Founded in 1950, we've been serving the Kalk Bay community for over 70 years,
                growing from a small gathering into a vibrant community of faith.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Our Mission
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We're dedicated to spreading God's love through worship, fellowship, and
                service to our community.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Join Us
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Sunday Services: 9:00 AM
                Wednesday Bible Study: 7:00 PM
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/about"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Learn More About Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAbout;