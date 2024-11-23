import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserCalendar from '../components/UserCalendar';

const Calendar = () => {
  const { user } = useAuth();

  // Redirect if not logged in or if user is admin
  if (!user || user.role === 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          My Calendar
        </h1>
        <UserCalendar />
      </div>
    </div>
  );
};

export default Calendar;