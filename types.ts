
export interface Activity {
  name: string;
  reasoning: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
  transport: {
    mode: string;
    duration: string;
    reasoning: string;
  };
  hotel: {
    name: string;
    category: string;
    reasoning: string;
  };
  logic: string;
}

export interface TripPlan {
  destination: string;
  duration: number;
  budgetRange: string;
  itinerary: ItineraryDay[];
  vibe: string;
  bestSeason: string;
}

export interface PhotoAnalysis {
  location: string;
  country: string;
  bestSeason: string;
  vibe: string;
}

export interface TripAlternative {
  name: string;
  description: string;
  impact: string;
  category: string;
}

export interface TripDetails {
  id: string;
  creatorId: string;
  startLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  speed: number;
  seats: number;
  availableSeats: number;
  description: string;
  creator: {
    name: string;
    avatar: string;
  };
}

export interface JoinRequest {
  id: string;
  tripId: string;
  tripRoute: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface TripSummary {
  id: string;
  creatorId: string;
  startLocation: string;
  destination: string;
  startDate: string;
  endDate: string;
  speed: number;
  seats: number;
  availableSeats: number;
  status: 'active' | 'completed' | 'full';
}
