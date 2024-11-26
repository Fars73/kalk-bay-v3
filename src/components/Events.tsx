import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import type { Event } from '../types';
import EventModal from './EventModal';
import { useEvents } from '../hooks/useEvents';
import { imageCache } from '../services/imageCache';
import { ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';
import { ref as dbRef, set, push } from 'firebase/database';
import { database } from '../lib/firebase';
import { storage } from '../lib/firebase';
import { cacheService } from '../services/cache';

const EventCard = React.memo(({ event, onEdit, onDelete, isAdmin }: { 
  event: Event; 
  onEdit?: () => void;
  onDelete?: () => void;
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

  const isEventCurrentlyOpen = (event: Event) => {
    if (!event.date || !event.time) return false;
    
    const now = new Date();
    const eventDate = new Date(`${event.date}T${event.time}`);
    
    // For Sunday Service (starts at 9:00 AM)
    if (event.recurrence?.dayOfWeek === 0) {
      const serviceEnd = new Date(eventDate.getTime() + (3 * 60 * 60 * 1000)); // 3 hours duration
      return now >= eventDate && now <= serviceEnd;
    }
    
    // For Wednesday Bible Study (starts at 7:00 PM)
    if (event.recurrence?.dayOfWeek === 3) {
      const studyEnd = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration
      return now >= eventDate && now <= studyEnd;
    }
    
    // For other events
    const eventEnd = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours duration
    return now >= eventDate && now <= eventEnd;
  };

  const validateAndUpdateEventDate = async (event: Event) => {
    if (!event.isPermanent || !event.recurrence) return;

    const eventDate = new Date(event.date!);
    const dayOfWeek = eventDate.getDay();

    // Check if the date matches the expected day of week
    if (dayOfWeek !== event.recurrence.dayOfWeek) {
      // Calculate the correct date
      const today = new Date();
      const daysUntil = (event.recurrence.dayOfWeek - today.getDay() + 7) % 7;
      const correctDate = new Date(today);
      correctDate.setDate(today.getDate() + daysUntil);
      
      // Update in database
      const eventRef = dbRef(database, `events/${event.id}`);
      await set(eventRef, {
        ...event,
        date: correctDate.toISOString().split('T')[0]
      });

      // Update cache
      const cachedEvents = cacheService.get<Event[]>('events') || [];
      const updatedEvents = cachedEvents.map(e => 
        e.id === event.id 
          ? { ...e, date: correctDate.toISOString().split('T')[0] }
          : e
      );
      cacheService.set('events', updatedEvents);
    }
  };

  useEffect(() => {
    validateAndUpdateEventDate(event);
  }, [event]);

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
        {isAdmin && (
          <div className="absolute top-2 right-2 flex space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <Edit className="h-5 w-5 text-gray-600" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Are you sure you want to delete this event?')) {
                    onDelete();
                  }
                }}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{event.title}</h3>
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 mb-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span>{event.time}</span>
            {event.date && <span className="ml-2">| {event.date}</span>}
          </div>
          {isEventCurrentlyOpen(event) && (
            <span className="text-green-500 font-semibold animate-pulse">
              Currently Open
            </span>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
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
      // Get the eventId from selectedEvent when editing, or undefined for new events
      let eventId = selectedEvent?.id || undefined;
      let imageUrl = eventData.imageUrl;

      // If it's a new image (not a URL), upload it to Firebase Storage
      if (imageUrl && !imageUrl.startsWith('http')) {
        const storageRef = ref(storage, `events/${Date.now()}-${eventId || 'new'}`);
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const uploadTask = await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(uploadTask.ref);
      }

      const eventToSave = {
        title: eventData.title,
        time: eventData.time,
        date: eventData.date,
        description: eventData.description,
        imageUrl: imageUrl,
        type: eventData.type || 'special'
      };

      if (eventId) {
        // Update existing event
        const eventRef = dbRef(database, `events/${eventId}`);
        await set(eventRef, eventToSave);
      } else {
        // Create new event
        const eventsRef = dbRef(database, 'events');
        const newEventRef = push(eventsRef);
        eventId = newEventRef.key!;
        await set(newEventRef, eventToSave);
      }

      // Update cache
      const cachedEvents = cacheService.get<Event[]>('events') || [];
      const updatedEvents = eventId 
        ? cachedEvents.map((event: Event) => event.id === eventId ? { ...eventToSave, id: eventId } : event)
        : [...cachedEvents, { ...eventToSave, id: eventId }];
      
      cacheService.set('events', updatedEvents);

      toast.success(`Event ${eventId ? 'updated' : 'created'} successfully!`);
      setShowModal(false);
      setSelectedEvent(undefined);
      
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(`Failed to ${selectedEvent ? 'update' : 'create'} event`);
    }
  };

  const handleDeleteEvent = async (eventId: string, imageUrl: string) => {
    try {
      // Delete event from database
      const eventRef = dbRef(database, `events/${eventId}`);
      await set(eventRef, null);

      // Delete image from storage if it exists
      if (imageUrl && imageUrl.includes('firebase')) {
        const imageRef = ref(storage, imageUrl);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
          // Continue even if image deletion fails
        }
      }

      // Update cache
      const cachedEvents = cacheService.get<Event[]>('events') || [];
      const updatedEvents = cachedEvents.filter(event => event.id !== eventId);
      cacheService.set('events', updatedEvents);

      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center mb-12">
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
        <div className="flex justify-center items-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Recent Events</h2>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ml-4"
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
              onDelete={() => handleDeleteEvent(event.id, event.imageUrl)}
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