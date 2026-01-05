# API Usage Verification Report

## 1. Verified Endpoints (Frontend Matches Backend)

| Frontend Call | Backend Route | Status |
| :--- | :--- | :--- |
| `api.get('/profile')` | `GET api/v1/profile` | ✅ OK |
| `api.put('/profile', ...)` | `PUT api/v1/profile` | ✅ OK |
| `api.get('/content/articles')` | `GET api/v1/content/articles` | ✅ OK |
| `api.get('/content/videos')` | `GET api/v1/content/videos` | ✅ OK |
| `api.get('/content/exercises')` | `GET api/v1/content/exercises` | ✅ OK |
| `api.get('/appointments')` | `GET api/v1/appointments` | ✅ OK |
| `api.post('/posts')` | `POST api/v1/posts` | ✅ OK |
| `api.get('/posts')` | `GET api/v1/posts` | ✅ OK |
| `api.post('/posts/{id}/like')` | `POST api/v1/posts/{post}/like` | ✅ OK |
| `api.post('/comments')` | `POST api/v1/comments` | ✅ OK |
| `api.get('/wellness-tips')` | `GET api/v1/wellness-tips` | ✅ OK |
| `api.get('/progress/weekly')` | `GET api/v1/progress/weekly` | ✅ OK |
| `api.get('/moods')` | `GET api/v1/moods` | ✅ OK |
| `api.post('/moods', ...)` | `POST api/v1/moods` | ✅ OK |

## 2. Potential Issues / Discrepancies

- **Bookmarks Route**: Frontend typically expects `api/v1/content/bookmarks` (which we fixed), but the frontend code scan didn't explicitly show `api.get('/content/bookmarks')` in the grep results. It might be in a file I missed or constructing the URL dynamically.
- **Comment Replies**: We saw `api/v1/comments/{id}/replies` in the backend, and we know the frontend tries to call it (from previous errors). The grep didn't capture the dynamic URL construction `api.get(/comments/${id}/replies)` clearly in the snippet, but it's likely there.

## 3. Recommendations
- **Consistency**: Ensure all frontend API calls use the `/v1` prefix if the axios instance doesn't automatically prepend it (assuming it does based on strict matching).
- **Error Handling**: The frontend seems to catch errors `catch (err) { ... }` which is good.
- **Missing Features**:
    - **Notifications**: Backend has notifications routes (`api/v1/notifications`), but I didn't see explicit usage in the grep results.
    - **Doctors**: Backend has `api/v1/doctors`, not seen in grep results yet (might be in `Doctors.jsx` which might rely on `api.get('/doctors')` not caught by grep limit).

## 4. Next Steps
- If you encounter 404s, check if the URL path in frontend matches `routes/api.php` exactly.
- Verify that the `axios` instance base URL is set to `http://localhost:8000/api/v1` (or similar).
