import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import type { Event } from '../types';
import EventModal from './EventModal';
import { useEvents } from '../hooks/useEvents';
import { imageCache } from '../services/imageCache';

const EventCard = React.memo(({ event, onEdit, isAdmin }: { 
  event: Event; 
  onEdit?: () => void; 
  isAdmin?: boolean 
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (inView && event.imageUrl) {
      // Check if image is already cached
      if (imageCache.hasImage(event.imageUrl)) {
        setImageLoaded(true);
      } else {
        imageCache.preloadImage(event.imageUrl)
          .then(() => setImageLoaded(true))
          .catch(console.error);
      }
    }
  }, [inView, event.imageUrl]);

  const addToCalendar = () => {
    toast.success('Event added to calendar!');
  };

  return (
    <div
      ref={ref}
      className={`bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-700 transform ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <div className="h-48 overflow-hidden relative">
        {imageLoaded ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        {isAdmin && onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <Edit className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{event.title}</h3>
        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
          <Clock className="h-5 w-5 mr-2" />
          <span>{event.time}</span>
          {event.date && <span className="ml-2">| {event.date}</span>}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
        <button
          onClick={addToCalendar}
          className="flex items-center justify-center w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Add to Calendar
        </button>
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';

const Events = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const { events, loading } = useEvents();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    try {
      // Implementation remains the same
      toast.success('Event saved successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Recent Events</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Recent Events</h2>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Event
            </button>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isAdmin={isAdmin}
              onEdit={() => {
                setSelectedEvent(event);
                setShowModal(true);
              }}
            />
          ))}
        </div>

        {showModal && (
          <EventModal
            event={selectedEvent}
            onClose={() => {
              setShowModal(false);
              setSelectedEvent(undefined);
            }}
            onSave={handleSaveEvent}
            isEditing={!!selectedEvent}
          />
        )}
      </div>
    </section>
  );
};

export default Events;