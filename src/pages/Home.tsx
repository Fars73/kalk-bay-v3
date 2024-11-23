import React from 'react';
import Hero from '../components/Hero';
import HomeAbout from '../components/HomeAbout';
import DirectionsMap from '../components/DirectionsMap';
import Contact from '../components/Contact';

const Home = () => {
  return (
    <div>
      <Hero />
      <HomeAbout />
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DirectionsMap />
        </div>
      </div>
      <Contact />
    </div>
  );
};

export default Home;