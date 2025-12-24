
import { Front } from "../types";

export interface LiveSeatResult {
  constituencyId: string;
  constituencyName: string;
  status: 'Leading' | 'Won' | 'Trailing';
  leaderFront: Front;
  leaderName: string;
  margin: number;
  turnout: number;
}

export interface LiveElectionSummary {
  udf: number;
  ldf: number;
  nda: number;
  others: number;
  statewideTurnout: number;
  lastUpdated: string;
  results: LiveSeatResult[];
}

/**
 * Fetches live election data from a provided URL.
 * Falls back to simulation if the link is not yet provided or fails.
 */
export const fetchLiveResults = async (url: string): Promise<LiveElectionSummary | null> => {
  try {
    // If the URL is provided, we fetch from it. 
    // Otherwise, we return null so the app knows to stay in 'Prep' mode.
    if (!url || url === 'pending') return null;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch live results");
    
    return await response.json();
  } catch (error) {
    console.error("Live Sync Error:", error);
    return null;
  }
};

/**
 * Mock function to simulate the "Same Result" for testing purposes
 */
export const getSimulatedLiveResults = (count: number): LiveElectionSummary => {
    return {
        udf: 72 + Math.floor(Math.random() * 5),
        ldf: 60 - Math.floor(Math.random() * 3),
        nda: 2,
        others: 6,
        statewideTurnout: 74.2,
        lastUpdated: new Date().toLocaleTimeString(),
        results: [] // Detailed results would go here
    };
};
