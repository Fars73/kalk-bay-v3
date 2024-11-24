import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Mail } from 'lucide-react';

const About = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const leaders = [
    {
      name: "Pastor John Smith",
      role: "Senior Pastor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
      email: "john.smith@kalkbaychurch.org"
    },
    {
      name: "Pastor Sarah Johnson",
      role: "Youth Pastor",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
      email: "sarah.johnson@kalkbaychurch.org"
    },
    {
      name: "Pastor Michael Chen",
      role: "Community Outreach",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80",
      email: "michael.chen@kalkbaychurch.org"
    }
  ];

  const handleContact = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div
          ref={ref}
          className={`transition-opacity duration-1000 ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">
            About Kalk Bay Community Church
          </h1>

          <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Our History
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Founded in 1950, Kalk Bay Community Church has been serving the local
                  community for over 70 years. What started as a small gathering of
                  believers has grown into a vibrant community of faith, deeply rooted
                  in God's word and committed to serving our community.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  To spread the love of Christ through worship, fellowship, and service
                  to our community. We believe in creating an inclusive environment
                  where everyone can experience God's love and grow in their faith journey.
                </p>
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Our Leadership Team
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {leaders.map((leader) => (
                  <div 
                    key={leader.name}
                    className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative w-40 h-40 mb-4">
                      <img
                        src={leader.image}
                        alt={leader.name}
                        className="w-full h-full rounded-full object-cover border-4 border-blue-500 dark:border-blue-400"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                      {leader.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {leader.role}
                    </p>
                    <button
                      onClick={() => handleContact(leader.email)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;