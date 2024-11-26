import { useState, useEffect } from 'react';
import { ref, onValue, set, get, push, DataSnapshot } from 'firebase/database';
import { database } from '../lib/firebase';
import { Event } from '../types';
import { cacheService } from '../services/cache';

const CACHE_KEY = 'events';

const DEFAULT_EVENTS = [
  {
    title: "Sunday Service", 
    description: "Sunday Service - a time worshiping in the Lord's presence.",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3",
    time: "10:00",
    type: "regular" as const,
    isPermanent: true,
    recurrence: {
      dayOfWeek: 0,
      frequency: "weekly"
    }
  },
  {
    title: "Bible Study",
    description: "Weekly Bible study and fellowship.",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65", 
    time: "19:00",
    type: "regular" as const,
    isPermanent: true,
    recurrence: {
      dayOfWeek: 3,
      frequency: "weekly"
    }
  }
];

const getNextDate = (dayOfWeek: number) => {
  const today = new Date();
  const currentDay = today.getDay();
  let daysUntil = dayOfWeek - currentDay;
  
  if (daysUntil <= 0) {
    daysUntil += 7;
  }
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);
  return nextDate.toISOString().split('T')[0];
};

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const eventsRef = ref(database, 'events');
    
    const initializePermanentEvents = async () => {
      const snapshot = await get(eventsRef);
      
      let existingSundayService: Event | undefined;
      let existingBibleStudy: Event | undefined;
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot: DataSnapshot) => {
          const event = childSnapshot.val() as Event;
          if (event.isPermanent && event.recurrence) {
            if (event.recurrence.dayOfWeek === 0) {
              existingSundayService = { ...event, id: childSnapshot.key as string };
            } else if (event.recurrence.dayOfWeek === 3) {
              existingBibleStudy = { ...event, id: childSnapshot.key as string };
            }
          }
        });
      }

      const updates: Record<string, Event> = {};

      if (!existingSundayService) {
        const sundayRef = push(eventsRef);
        updates[sundayRef.key!] = {
          ...DEFAULT_EVENTS[0],
          id: sundayRef.key!,
          date: getNextDate(0)
        } as Event;
      }

      if (!existingBibleStudy) {
        const wednesdayRef = push(eventsRef);
        updates[wednesdayRef.key!] = {
          ...DEFAULT_EVENTS[1],
          id: wednesdayRef.key!,
          date: getNextDate(3)
        } as Event;
      }

      if (Object.keys(updates).length > 0) {
        await set(ref(database, 'events'), updates);
      }
    };

    const validateAndUpdatePermanentEvents = async (events: Event[]) => {
      const updates: Record<string, Event> = {};
      const now = new Date();

      events.forEach(event => {
        if (event.isPermanent && event.recurrence) {
          const eventDate = new Date(`${event.date}T${event.time}`);
          const eventEnd = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000));
          
          if (now > eventEnd) {
            const nextDate = getNextDate(event.recurrence.dayOfWeek);
            updates[`events/${event.id}`] = {
              ...event,
              date: nextDate
            };
          }
        }
      });

      if (Object.keys(updates).length > 0) {
        await set(ref(database), updates);
      }
    };

    const checkForDeletedPermanentEvents = async (events: Event[]) => {
      const hasSundayService = events.some(
        event => event.isPermanent && event.recurrence?.dayOfWeek === 0
      );
      const hasBibleStudy = events.some(
        event => event.isPermanent && event.recurrence?.dayOfWeek === 3
      );

      if (!hasSundayService || !hasBibleStudy) {
        await initializePermanentEvents();
      }
    };

    initializePermanentEvents();

    const unsubscribe = onValue(eventsRef, async (snapshot: DataSnapshot) => {
      try {
        if (!snapshot.exists()) {
          await initializePermanentEvents();
          setEvents([]);
          setLoading(false);
          return;
        }

        const allEvents: Event[] = [];
        snapshot.forEach((childSnapshot: DataSnapshot) => {
          const data = childSnapshot.val() as Event;
          if (data) {
            allEvents.push({
              ...data,
              id: childSnapshot.key || ''
            });
          }
        });

        await checkForDeletedPermanentEvents(allEvents);
        await validateAndUpdatePermanentEvents(allEvents);
        
        const sortedEvents = allEvents.sort((a, b) => {
          if (!a.date || !b.date) return 0;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setEvents(sortedEvents);
        cacheService.set(CACHE_KEY, sortedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch events'));
      } finally {
        setLoading(false);
      }
    }, (err: Error) => {
      console.error('Error in onValue subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to subscribe to events'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { events, loading, error };
};