import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const BookmarkContext = createContext(null);

export function BookmarkProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper to normalize content type
    const normalizeType = (fullType) => {
        if (!fullType) return '';
        if (fullType.includes('Article')) return 'article';
        if (fullType.includes('Video')) return 'video';
        if (fullType.includes('Exercise')) return 'exercise';
        return fullType.toLowerCase();
    };

    // Fetch bookmarks
    const fetchBookmarks = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            const res = await api.get('/content/bookmarks');
            const rawData = res.data?.data?.data || res.data?.data || res.data || [];
            const data = Array.isArray(rawData) ? rawData : [];

            // Normalize the data structure for consistent checking
            const normalizedBookmarks = data.map(b => ({
                ...b,
                normalized_type: normalizeType(b.bookmarkable_type),
                normalized_id: b.bookmarkable_id
            }));

            setBookmarks(normalizedBookmarks);
        } catch (error) {
            console.error('Failed to fetch bookmarks:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Check if an item is bookmarked
    const isBookmarked = useCallback((contentType, contentId) => {
        if (!bookmarks.length) return false;
        return bookmarks.some(b =>
            b.normalized_type === contentType &&
            parseInt(b.normalized_id) === parseInt(contentId)
        );
    }, [bookmarks]);

    // Toggle bookmark
    const toggleBookmark = async (contentType, contentId) => {
        if (!isAuthenticated) return false;

        // Optimistic update
        const isCurrentlyBookmarked = isBookmarked(contentType, contentId);

        try {
            // Update state immediately
            if (isCurrentlyBookmarked) {
                setBookmarks(prev => prev.filter(b =>
                    !(b.normalized_type === contentType && parseInt(b.normalized_id) === parseInt(contentId))
                ));
            } else {
                setBookmarks(prev => [...prev, {
                    normalized_type: contentType,
                    normalized_id: contentId,
                    bookmarkable_type: `App\\Models\\${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`, // Mock for internal consistency
                    bookmarkable_id: contentId
                }]);
            }

            // Make API call
            await api.post('/content/bookmark', {
                type: contentType,
                id: contentId,
            });

            // Re-fetch to ensure sync with server and get full bookmarkable data
            await fetchBookmarks();
            return true;
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
            // Revert on error
            if (isCurrentlyBookmarked) {
                // Add it back
                setBookmarks(prev => [...prev, {
                    normalized_type: contentType,
                    normalized_id: contentId,
                    bookmarkable_id: contentId
                }]);
            } else {
                // Remove it
                setBookmarks(prev => prev.filter(b =>
                    !(b.normalized_type === contentType && parseInt(b.normalized_id) === parseInt(contentId))
                ));
            }
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
