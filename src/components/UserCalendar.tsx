import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { database } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { useAuth } from '../hooks/useAuth';
import { Event } from '../types';
import { Calendar as CalendarIcon } from 'lucide-react';

const UserCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user) return;

      try {
        const userEventsRef = ref(database, `userEvents/${user.uid}`);
        const snapshot = await get(userEventsRef);
        
        if (snapshot.exists()) {
          const eventIds = Object.values(snapshot.val());
          const eventsRef = ref(database, 'events');
          const eventsSnapshot = await get(eventsRef);
          
          if (eventsSnapshot.exists()) {
            const allEvents = eventsSnapshot.val();
            const userEvents = eventIds
              .map((id: string) => ({
                id,
                ...allEvents[id]
              }))
              .filter(Boolean);
            
            setEvents(userEvents as Event[]);
          }
        }
      } catch (error) {
        console.error('Error fetching user events:', error);
      }
    };

    fetchUserEvents();
  }, [user]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date!);
      return format(eventDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2" />
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="space-x-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 dark:text-gray-300 py-2"
            >
              {day}
            </div>
          ))}
          
          {days.map(day => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] p-2 border border-gray-200 dark:border-gray-700 ${
                  !isSameMonth(day, currentDate)
                    ? 'bg-gray-50 dark:bg-gray-900'
                    : 'bg-white dark:bg-gray-800'
                } ${
                  isToday(day)
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
              >
                <div className="text-right mb-1">
                  <span className={`text-sm ${
                    isToday(day)
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-xs p-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserCalendar;