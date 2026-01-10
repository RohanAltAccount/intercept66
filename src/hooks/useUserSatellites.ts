import { useState, useCallback, useEffect } from 'react';
import { 
  UserSatellite, 
  OrbitState, 
  propagateUserSatellite, 
  validateSatellitePosition,
  generateSatelliteColor,
  CollisionPrediction,
  checkAllCollisions
} from '@/lib/collision-detection';
import { Satellite } from './useSatelliteData';

export interface UserSatelliteWithState extends UserSatellite {
  currentState: OrbitState;
}

export function useUserSatellites(realSatellites: Satellite[] = []) {
  const [userSatellites, setUserSatellites] = useState<UserSatelliteWithState[]>([]);
  const [collisionPredictions, setCollisionPredictions] = useState<CollisionPrediction[]>([]);
  const [simulationTime, setSimulationTime] = useState(0);

  // add a new user satellite
  const addSatellite = useCallback((x: number, y: number, z: number, mass: number = 1000, name?: string) => {
    const validation = validateSatellitePosition(x, y, z);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const newSatellite: UserSatellite = {
      id: `user-${Date.now()}`,
      name: name || `satellite-${userSatellites.length + 1}`,
      x,
      y,
      z,
      mass,
      color: generateSatelliteColor(),
      createdAt: new Date(),
    };

    const initialState = propagateUserSatellite(newSatellite, 0);

    setUserSatellites(prev => [...prev, { ...newSatellite, currentState: initialState }]);
    return { success: true };
  }, [userSatellites.length]);

  // remove a user satellite
  const removeSatellite = useCallback((id: string) => {
    setUserSatellites(prev => prev.filter(sat => sat.id !== id));
  }, []);

  // clear all user satellites
  const clearAllSatellites = useCallback(() => {
    setUserSatellites([]);
  }, []);

  // update satellite positions based on simulation time
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulationTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // propagate satellite positions
  useEffect(() => {
    setUserSatellites(prev => 
      prev.map(sat => ({
        ...sat,
        currentState: propagateUserSatellite(sat, simulationTime)
      }))
    );
  }, [simulationTime]);

  // calculate collision predictions
  useEffect(() => {
    // combine user satellites with real satellites for collision detection
    const allSatellites = [
      ...userSatellites.map(sat => ({
        id: sat.id,
        name: sat.name,
        position: {
          x: sat.currentState.x,
          y: sat.currentState.y,
          z: sat.currentState.z,
          vx: sat.currentState.vx,
          vy: sat.currentState.vy,
          vz: sat.currentState.vz,
        }
      })),
      ...realSatellites.map(sat => ({
        id: sat.id,
        name: sat.name,
        position: {
          x: sat.position.x,
          y: sat.position.y,
          z: sat.position.z,
          vx: sat.position.vx,
          vy: sat.position.vy,
          vz: sat.position.vz,
        }
      }))
    ];

    if (allSatellites.length >= 2) {
      const predictions = checkAllCollisions(allSatellites, 7200); // 2 hours prediction
      setCollisionPredictions(predictions.filter(p => p.riskLevel !== 'safe').slice(0, 20));
    } else {
      setCollisionPredictions([]);
    }
  }, [userSatellites, realSatellites, simulationTime]);

  return {
    userSatellites,
    collisionPredictions,
    addSatellite,
    removeSatellite,
    clearAllSatellites,
    simulationTime,
  };
}
