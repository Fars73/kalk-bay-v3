import React from 'react';
import { useInView } from 'react-intersection-observer';

const Hero = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div className="relative h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/timereaper-4f20e.appspot.com/o/cross3.jpeg?alt=media&token=d5d452fb-293f-4f09-b2d5-1a8e9f870bc5")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>
      
      <div
        ref={ref}
        className={`relative h-full flex items-center justify-center text-center px-4 transition-opacity duration-1000 ${
          inView ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to
            <br/> 
            Kalk Bay Community Church
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8">
            Join us in worship as we grow together in faith, hope, and love.
          </p>
          <button
            onClick={() => document.getElementById('join-us')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
          >
            Join Our Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;