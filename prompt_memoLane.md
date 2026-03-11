Create a new full-stack project named **MemoLane**, a personal media archive web portal.

Tech stack:

Frontend:

* React (Vite)
* TailwindCSS
* React Router

Backend:

* Python FastAPI
* Uvicorn server

Project goals:

MemoLane will stream and browse personal photos and videos stored on disk in the following structure:

```
media/
   2026/
      03_March/
         IMG_123.jpg
         VID_123.mp4
   2025/
      12_December/
```

The application should provide:

1. Authentication

* password-based login
* protected routes

2. Timeline Navigation

* left sidebar showing years
* right panel showing scrollable timeline grouped by year and month
* clicking a year scrolls to that section

3. Media Browser

* display images and videos in grid view
* click image to open fullscreen viewer
* video playback via HTML5 player

4. Backend API endpoints

Implement:

```
GET /api/years
GET /api/months/{year}
GET /api/media/{year}/{month}
GET /media/{year}/{month}/{file}
POST /api/login
```

5. Backend requirements

* media root path configurable
* secure file serving
* prevent path traversal
* stream videos efficiently
* return image thumbnails later

6. Folder structure

```
MemoLane/
   backend/
      main.py
      auth.py
      media_api.py
   frontend/
      React app
   media/
```

7. Frontend requirements

Create pages:

LoginPage
TimelinePage

TimelinePage layout:

Left sidebar:

* list of years

Main content:

* scrollable timeline grouped by year → month
* photo/video grid

Use smooth scrolling when selecting a year.

8. Styling

Use TailwindCSS and keep UI minimal but modern.

9. Run instructions

Backend:

```
uvicorn main:app --reload
```

Frontend:

```
npm run dev
```

The project should run locally and allow browsing media files immediately.
