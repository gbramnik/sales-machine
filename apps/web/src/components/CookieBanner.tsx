import { useState, useEffect } from 'react';

/**
 * Cookie Banner Component
 * 
 * Displays a minimal cookie consent banner for GDPR compliance.
 * Only uses session cookies (no tracking cookies).
 */
export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleLearnMore = () => {
    // Open privacy policy in new tab
    window.open('/legal/privacy-policy', '_blank');
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 border-t border-gray-700">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            We use <strong>session cookies only</strong> to keep you logged in. No tracking cookies.
            {' '}
            <button
              onClick={handleLearnMore}
              className="underline hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              Learn More
            </button>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

