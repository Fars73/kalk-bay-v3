import React from 'react';
import { useInView } from 'react-intersection-observer';

const About = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          ref={ref}
          className={`transition-opacity duration-1000 ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            About Kalk Bay Community Church
          </h1>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Our History
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Founded in 1950, Kalk Bay Community Church has been serving the local
                  community for over 70 years. What started as a small gathering of
                  believers has grown into a vibrant community of faith.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  To spread the love of Christ through worship, fellowship, and service
                  to our community. We believe in creating an inclusive environment
                  where everyone can experience God's love.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Our Leadership
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      Pastor John Smith
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Senior Pastor
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      Pastor Sarah Johnson
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Youth Pastor
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Join Us
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We welcome everyone to join our services every Sunday at 9:00 AM.
                  Come experience the warmth of our community and grow with us in faith.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;