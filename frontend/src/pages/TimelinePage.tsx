import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface MediaItem {
  filename: string;
  type: 'image' | 'video';
  url: string;
}

interface MonthData {
  month: string;
  media: MediaItem[];
}

interface YearData {
  year: string;
  months: MonthData[];
}

const TimelinePage: React.FC = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [years, setYears] = useState<string[]>([]);
  const [timelineData, setTimelineData] = useState<YearData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const yearRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchTimelineData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found.');
        }

        // Fetch years
        const yearsResponse = await fetch(`${API_BASE_URL}/api/years`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!yearsResponse.ok) throw new Error('Failed to fetch years');
        const fetchedYears: string[] = await yearsResponse.json();
        setYears(fetchedYears);

        const allTimelineData: YearData[] = [];

        for (const year of fetchedYears) {
          // Fetch months for each year
          const monthsResponse = await fetch(`${API_BASE_URL}/api/months/${year}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!monthsResponse.ok) throw new Error(`Failed to fetch months for ${year}`);
          const fetchedMonths: string[] = await monthsResponse.json();

          const monthsWithMedia: MonthData[] = [];
          for (const month of fetchedMonths) {
            // Fetch media for each month
            const mediaResponse = await fetch(`${API_BASE_URL}/api/media/${year}/${month}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!mediaResponse.ok) throw new Error(`Failed to fetch media for ${month}/${year}`);
            const fetchedMedia: MediaItem[] = await mediaResponse.json();
            if (fetchedMedia.length > 0) {
              monthsWithMedia.push({ month, media: fetchedMedia });
            }
          }
          if (monthsWithMedia.length > 0) {
            allTimelineData.push({ year, months: monthsWithMedia });
          }
        }
        setTimelineData(allTimelineData);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, [isAuthenticated, navigate, API_BASE_URL]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const scrollToYear = (year: string) => {
    yearRefs.current[year]?.scrollIntoView({ behavior: 'smooth' });
  };

  const openMediaViewer = (media: MediaItem) => {
    setSelectedMedia(media);
  };

  const closeMediaViewer = () => {
    setSelectedMedia(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading timeline...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">MemoLane</h1>
        <nav className="flex-grow">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Years</h2>
          <ul>
            {years.map((year) => (
              <li key={year} className="mb-2">
                <button
                  onClick={() => scrollToYear(year)}
                  className="text-blue-600 hover:text-blue-800 text-lg focus:outline-none"
                >
                  {year}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-4xl font-extrabold mb-8 text-gray-900">Your Media Timeline</h2>
        {timelineData.length === 0 && (
          <p className="text-gray-600 text-lg">No media found. Start by adding files to your media folder!</p>
        )}
        {timelineData.map((yearData) => (
          <div key={yearData.year} ref={(el) => { yearRefs.current[yearData.year] = el; }} className="mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 sticky top-0 bg-gray-100 py-4 z-10">{yearData.year}</h3>
            {yearData.months.map((monthData) => (
              <div key={`${yearData.year}-${monthData.month}`} className="mb-8">
                <h4 className="text-2xl font-semibold text-gray-700 mb-4">{monthData.month}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {monthData.media.map((media) => (
                    <div
                      key={media.filename}
                      className="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      onClick={() => openMediaViewer(media)}
                    >
                      {media.type === 'image' ? (
                        <img
                          src={`${API_BASE_URL}${media.url}`}
                          alt={media.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={`${API_BASE_URL}${media.url}`}
                          className="w-full h-full object-cover"
                          controls={false}
                          muted
                          loop
                          preload="metadata"
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <p className="text-white text-sm font-medium">{media.filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeMediaViewer}
        >
          <div className="relative max-w-screen-lg max-h-screen-lg" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === 'image' ? (
              <img
                src={`${API_BASE_URL}${selectedMedia.url}`}
                alt={selectedMedia.filename}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={`${API_BASE_URL}${selectedMedia.url}`}
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
              />
            )}
            <button
              onClick={closeMediaViewer}
              className="absolute top-4 right-4 text-white text-3xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              &times;
            </button>
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-md">
              {selectedMedia.filename}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
