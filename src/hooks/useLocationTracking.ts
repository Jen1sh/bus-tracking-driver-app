import { useState } from 'react';

export async function requestPermissions() {
  return true;
}

export function showPermissionAlert() {}

export function useLocationTracking() {
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = async (_skipPermissionCheck = false) => {
    setIsTracking(true);
    return true;
  };

  const stopTracking = async () => {
    setIsTracking(false);
  };

  return { isTracking, startTracking, stopTracking };
}
