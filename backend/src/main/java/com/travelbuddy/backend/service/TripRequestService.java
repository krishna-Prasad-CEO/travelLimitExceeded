package com.travelbuddy.backend.service;

import com.travelbuddy.backend.entity.RequestStatus;
import com.travelbuddy.backend.entity.TripRequest;
import com.travelbuddy.backend.repository.TripRepository;
import com.travelbuddy.backend.repository.TripRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import com.travelbuddy.backend.entity.Trip;


@Service
@RequiredArgsConstructor
public class TripRequestService {


    private final TripRequestRepository repository;
    private final TripRepository tripRepository;


    public TripRequest sendRequest(Long tripId, Long userId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        long approvedCount = repository.countByTripIdAndStatus(tripId, RequestStatus.APPROVED);

        if (approvedCount >= trip.getMaxSeats()) {
            throw new RuntimeException("Trip is full");
        }

        TripRequest request = TripRequest.builder()
                .tripId(tripId)
                .userId(userId)
                .status(RequestStatus.PENDING)
                .requestedAt(java.time.LocalDateTime.now())
                .build();

        return repository.save(request);
    }


    public TripRequest approveRequest(Long requestId) {
        TripRequest request = repository.findById(requestId).orElseThrow();
        request.setStatus(RequestStatus.APPROVED);
        return repository.save(request);
    }

    public TripRequest rejectRequest(Long requestId) {
        TripRequest request = repository.findById(requestId).orElseThrow();
        request.setStatus(RequestStatus.REJECTED);
        return repository.save(request);
    }

    public List<TripRequest> getRequestsForTrip(Long tripId) {
        return repository.findByTripId(tripId);
    }

    public List<TripRequest> getApprovedTripsForUser(Long userId) {
        return repository.findByUserIdAndStatus(userId, RequestStatus.APPROVED);
    }


}
