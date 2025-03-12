import React, { createContext, useContext } from "react";

const TrackingContext = createContext({
  trackEvent: () => {}, // Fallback: No-op function
});

export const useTracking = () => {
  return useContext(TrackingContext);
};

export const TrackingProvider = ({ children }) => {
  const isBrowser = typeof window !== "undefined";

  const trackEvent = (eventName, eventData = {}) => {
    if (isBrowser && window.umami && typeof window.umami.track === "function") {
      window.umami.track(eventName, eventData);
    }
  };

  return (
    <TrackingContext.Provider value={{ trackEvent }}>
      {children}
    </TrackingContext.Provider>
  );
};