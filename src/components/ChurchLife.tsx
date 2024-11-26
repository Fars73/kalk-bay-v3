import React from 'react';
import { useInView } from 'react-intersection-observer';
import { 
  Users, Calendar, Heart, Book, HandHelpingIcon, Church, 
  Baby, School, Clock, Coffee, Hammer, Globe
} from 'lucide-react';

const ChurchLife = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const activities = [
    { icon: <Calendar className="w-6 h-6" />, name: "Weekly Preaching", time: "Sundays 9:00 AM" },
    { icon: <Heart className="w-6 h-6" />, name: "Birthday Celebrations", time: "Monthly" },
    { icon: <Users className="w-6 h-6" />, name: "Ladies Fellowship", time: "Tuesdays 7:00 PM" },
    { icon: <Users className="w-6 h-6" />, name: "Men's Fellowship", time: "Thursdays 7:00 PM" },
    { icon: <School className="w-6 h-6" />, name: "YDC", time: "Fridays 6:00 PM" },
    { icon: <Baby className="w-6 h-6" />, name: "Toddler's Club", time: "Wednesdays 10:00 AM" },
    { icon: <Book className="w-6 h-6" />, name: "Sunday School", time: "Sundays 10:30 AM" },
    { icon: <Heart className="w-6 h-6" />, name: "Joy Club", time: "Saturdays 2:00 PM" },
    { icon: <HandHelpingIcon className="w-6 h-6" />, name: "Morning Prayer", time: "Fridays 6:00 AM" },
    { icon: <Clock className="w-6 h-6" />, name: "24hr Prayer Chain", time: "Monthly" },
    { icon: <Church className="w-6 h-6" />, name: "Shelter Ministry", time: "Weekly" },
    { icon: <Book className="w-6 h-6" />, name: "Bible Study", time: "Wednesdays 7:00 PM" },
    { icon: <Hammer className="w-6 h-6" />, name: "Pallet Project", time: "Saturdays" }
  ];

  const missionaries = [
    { name: "Willem & Edith Conradie", region: "South Africa" },
    { name: "Leah Ramazani", region: "Congo" },
    { name: "Patrick & Kellee Cogdill", region: "USA" },
    { name: "Megan & Peter Gardner", region: "Australia" },
    { name: "Marcus & Evie Keller", region: "Germany" },
    { name: "Jaco & Sandra Leeuwner", region: "Namibia" },
    { name: "Marvin & Veronika Petersen", region: "Switzerland" },
    { name: "Daniel & Patience Simango", region: "Zimbabwe" },
    { name: "Elien van der Wekken", region: "Netherlands" }
  ];

  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 transform ${
            inView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          {/* Weekly Activities Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Weekly Activities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full text-blue-600 dark:text-blue-400">
                      {activity.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {activity.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missionary Families Section */}
          <div>
            <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Our Missionary Families
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {missionaries.map((missionary, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                      <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {missionary.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Serving in {missionary.region}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchLife; 