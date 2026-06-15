import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const EventContext = createContext();

const API_BASE = 'http://localhost:8003';

export function EventProvider({ children }) {
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [regLoading, setRegLoading] = useState(false);
    const [eventsLoading, setEventsLoading] = useState(false);

    // Fetch events from MongoDB
    const fetchEvents = useCallback(async () => {
        setEventsLoading(true);
        try {
            const res = await fetch(API_BASE + '/eventservice/events');
            const data = await res.json();
            if (data.code === 200 && data.events) {
                setEvents(data.events);
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setEventsLoading(false);
        }
    }, []);

    // Fetch registrations from MongoDB on mount
    const fetchRegistrations = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setRegLoading(true);
        try {
            const res = await fetch(API_BASE + '/regservice/getall', {
                headers: { 'Token': token }
            });
            const data = await res.json();
            if (data.code === 200 && data.registrations) {
                setRegistrations(data.registrations);
            }
        } catch (err) {
            console.error('Failed to fetch registrations:', err);
        } finally {
            setRegLoading(false);
        }
    }, []);

    // Fetch my registrations (student view - by email)
    const fetchMyRegistrations = useCallback(async (email) => {
        const token = localStorage.getItem('token');
        if (!token || !email) return;
        setRegLoading(true);
        try {
            const res = await fetch(API_BASE + `/regservice/getmy/${email}`, {
                headers: { 'Token': token }
            });
            const data = await res.json();
            if (data.code === 200 && data.registrations) {
                setRegistrations(data.registrations);
            }
        } catch (err) {
            console.error('Failed to fetch my registrations:', err);
        } finally {
            setRegLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchEvents();
        const token = localStorage.getItem('token');
        if (token) {
            fetchRegistrations();
        }
    }, [fetchEvents, fetchRegistrations]);

    const addEvent = async (eventName, eventDate) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_BASE + '/eventservice/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Token': token || '' },
                body: JSON.stringify({ name: eventName, date: eventDate })
            });
            const data = await res.json();
            if (data.code === 200) {
                await fetchEvents();
            }
        } catch (err) {
            console.error('Failed to add event:', err);
        }
    };

    const removeEvent = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_BASE + `/eventservice/events/${id}`, {
                method: 'DELETE',
                headers: { 'Token': token || '' }
            });
            const data = await res.json();
            if (data.code === 200) {
                await fetchEvents();
            }
        } catch (err) {
            console.error('Failed to remove event:', err);
        }
    };

    const updateEvent = async (id, eventName, eventDate) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(API_BASE + `/eventservice/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Token': token || '' },
                body: JSON.stringify({ name: eventName, date: eventDate })
            });
            const data = await res.json();
            if (data.code === 200) {
                await fetchEvents();
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message };
        } catch (err) {
            console.error('Failed to update event:', err);
            return { success: false, message: 'Failed to update event' };
        }
    };

    // Vector Search — search events by meaning
    const searchEvents = async (query) => {
        try {
            const res = await fetch(API_BASE + `/eventservice/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.code === 200) {
                return data;
            }
            return { results: [], totalResults: 0 };
        } catch (err) {
            console.error('Vector search error:', err);
            return { results: [], totalResults: 0 };
        }
    };

    // Re-index embeddings for existing events
    const reindexEvents = async () => {
        try {
            const res = await fetch(API_BASE + '/eventservice/reindex', { method: 'POST' });
            const data = await res.json();
            return data;
        } catch (err) {
            console.error('Reindex error:', err);
            return { code: 500, message: 'Failed to reindex' };
        }
    };

    // Add registration via MongoDB API
    const addRegistration = async (registration) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return { success: false, message: 'Not authenticated' };
        }
        try {
            const res = await fetch(API_BASE + '/regservice/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Token': token
                },
                body: JSON.stringify(registration)
            });
            const data = await res.json();
            if (data.code === 200) {
                await fetchRegistrations();
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'Failed to register' };
            }
        } catch (err) {
            console.error('Registration error:', err);
            return { success: false, message: 'Server error. Please try again.' };
        }
    };

    // Remove registration via MongoDB API
    const removeRegistration = async (id, email, eventName) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(API_BASE + `/regservice/delete/${id}?email=${encodeURIComponent(email)}&eventName=${encodeURIComponent(eventName)}`, {
                method: 'DELETE',
                headers: { 'Token': token }
            });
            const data = await res.json();
            if (data.code === 200) {
                await fetchRegistrations();
            }
        } catch (err) {
            console.error('Delete registration error:', err);
        }
    };

    const updateRegistration = async (id, registration) => {
        const token = localStorage.getItem('token');
        if (!token) return { success: false, message: 'Not authenticated' };
        try {
            const res = await fetch(API_BASE + `/regservice/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Token': token
                },
                body: JSON.stringify(registration)
            });
            const data = await res.json();
            if (data.code === 200) {
                await fetchRegistrations();
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'Failed to update registration' };
            }
        } catch (err) {
            console.error('Update registration error:', err);
            return { success: false, message: 'Server error. Please try again.' };
        }
    };

    return (
        <EventContext.Provider value={{
            events, registrations, regLoading, eventsLoading,
            addEvent, removeEvent, updateEvent,
            addRegistration, removeRegistration, updateRegistration,
            fetchRegistrations, fetchMyRegistrations, fetchEvents,
            searchEvents, reindexEvents
        }}>
            {children}
        </EventContext.Provider>
    );
}

export function useEvents() {
    return useContext(EventContext);
}

export default EventContext;
