import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const BookmarkContext = createContext(null);

export function BookmarkProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch bookmarks
    const fetchBookmarks = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const res = await api.get('/content/bookmarks');
            const data = res.data?.data?.data || res.data?.data || res.data || [];
            setBookmarks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch bookmarks:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Check if an item is bookmarked
    const isBookmarked = useCallback((contentType, contentId) => {
        return bookmarks.some(b =>
            b.content_type === contentType && b.content_id === contentId
        );
    }, [bookmarks]);

    // Toggle bookmark
    const toggleBookmark = async (contentType, contentId) => {
        if (!isAuthenticated) return false;

        try {
            const res = await api.post('/content/bookmark', {
                content_type: contentType,
                content_id: contentId,
            });

            // If it was bookmarked, remove it; otherwise add it
            if (isBookmarked(contentType, contentId)) {
                setBookmarks(prev => prev.filter(b =>
                    !(b.content_type === contentType && b.content_id === contentId)
                ));
            } else {
                // Add new bookmark to state
                const newBookmark = res.data?.data || { content_type: contentType, content_id: contentId };
                setBookmarks(prev => [...prev, newBookmark]);
            }
            return true;
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
            return false;
        }
    };

    // Fetch on mount and when auth changes
    useEffect(() => {
        if (isAuthenticated) {
            fetchBookmarks();
        } else {
            setBookmarks([]);
        }
    }, [isAuthenticated, fetchBookmarks]);

    return (
        <BookmarkContext.Provider value={{
            bookmarks,
            loading,
            fetchBookmarks,
            isBookmarked,
            toggleBookmark,
        }}>
            {children}
        </BookmarkContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmarks must be used within a BookmarkProvider');
    }
    return context;
}
