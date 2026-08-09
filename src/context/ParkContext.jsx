import React, { createContext, useState, useContext, useEffect } from 'react';
import { ALL_PARKS } from '../data/parks';

const ParkContext = createContext(null);

const STORAGE_KEY = 'hwc_selected_park';

export const ParkProvider = ({ children }) => {
  const [selectedParkId, setSelectedParkId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || 'kaziranga';
  });

  const selectedPark = ALL_PARKS.find(p => p.id === selectedParkId) || ALL_PARKS[0];

  const selectPark = (parkId) => {
    setSelectedParkId(parkId);
    localStorage.setItem(STORAGE_KEY, parkId);
  };

  return (
    <ParkContext.Provider value={{ selectedPark, selectedParkId, selectPark, allParks: ALL_PARKS }}>
      {children}
    </ParkContext.Provider>
  );
};

export const usePark = () => useContext(ParkContext);
