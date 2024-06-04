import { useReducer, useEffect } from 'react';

export const useWindowEvents = () => {
  // Initial state and reducer function
  const initialState = {
    windows: [] // Assuming windows is part of the initial state
  };
  const [state, dispatch] = useReducer(windowReducer, initialState);

  const onWindowCreated = (window) => {
    console.log("👂window created", window);
    dispatch({ type: WINDOW_CREATED, window });
  };

  useEffect(() => {
    // Add event listener
    chrome.windows.onCreated.addListener(onWindowCreated);

    // Cleanup function to remove event listener
    return () => {
      chrome.windows.onCreated.removeListener(onWindowCreated);
    };
  }, []); // Empty dependency array means this effect runs only once on mount

  // The state is now managed by useReducer and can be used as needed
  return { state, dispatch };
};