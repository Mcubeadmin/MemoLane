# MemoLane Project Setup and Run Instructions

This document outlines how to set up and run the MemoLane full-stack application.

## Project Structure

```
MemoLane/
   backend/
      main.py
      auth.py
      media_api.py
      requirements.txt
   frontend/
      (React app files)
   media/
      2026/
         03_March/
            IMG_123.jpg
            VID_123.mp4
```

## Backend Setup and Run

1.  **Navigate to the backend directory:**
    ```bash
    cd MemoLane/backend
    ```

2.  **Create a Python virtual environment (recommended):**
    ```bash
    python3 -m venv venv
    ```

3.  **Activate the virtual environment:**
    *   On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
    *   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```

4.  **Install backend dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the FastAPI backend server:**
    ```bash
    uvicorn main:app --reload
    ```
    The backend will run on `http://localhost:8000`.

## Frontend Setup and Run

1.  **Navigate to the frontend directory:**
    ```bash
    cd MemoLane/frontend
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

3.  **Build the frontend application:**
    ```bash
    npm run build
    ```
    This will create a `dist` directory inside `frontend/` which the backend will serve.

4.  **Start the frontend development server (optional, for frontend development):**
    ```bash
    npm run dev
    ```
    The frontend development server will typically run on `http://localhost:5173`. However, for the full-stack experience where the backend serves the frontend, you only need to run the backend after building the frontend.

## Accessing the Application

Once both the backend and frontend (if using `npm run dev`) are running, or if you've built the frontend and are running only the backend:

*   Open your web browser and go to `http://localhost:8000`.

### Login Credentials

*   **Username:** `testuser`
*   **Password:** `testpassword`

## Important Notes

*   **Media Files:** The application expects media files (images and videos) to be organized in the `media/{year}/{month}/` structure. You can add your own files to this directory.
*   **Security:** The provided `SECRET_KEY` in `backend/auth.py` is for development purposes only. **Change it to a strong, random value in a production environment.**
*   **CORS:** The backend is configured with `allow_origins=["*"]` for development convenience. **Restrict this to your frontend's actual origin in a production environment.**
*   **Path Traversal:** The backend includes basic path traversal prevention for serving media files.
*   **Video Streaming:** Videos are streamed efficiently using `StreamingResponse`.
*   **Image Thumbnails:** The current implementation serves full images. Thumbnail generation is a future enhancement.
