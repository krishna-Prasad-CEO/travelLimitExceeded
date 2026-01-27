package com.travelbuddy.backend.service;

import com.travelbuddy.backend.entity.Trip;
import com.travelbuddy.backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;

    public Trip createTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    public List<Trip> searchTrips(String departure, String arrival, LocalDate date) {

        LocalDate startDate = date.minusDays(2);
        LocalDate endDate = date.plusDays(2);

        return tripRepository.searchTrips(departure, arrival, startDate, endDate);
    }

    public List<Trip> getTripsByRider(Long riderId) {
        return tripRepository.findByRiderId(riderId);
    }

}





