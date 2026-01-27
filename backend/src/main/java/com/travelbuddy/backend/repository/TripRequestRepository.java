package com.travelbuddy.backend.repository;

import com.travelbuddy.backend.entity.RequestStatus;
import com.travelbuddy.backend.entity.TripRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRequestRepository extends JpaRepository<TripRequest, Long> {

    List<TripRequest> findByTripId(Long tripId);
    boolean existsByTripIdAndUserId(Long tripId, Long userId);
    List<TripRequest> findByUserId(Long userId);
    List<TripRequest> findByUserIdAndStatus(Long userId, RequestStatus status);
    long countByTripIdAndStatus(Long tripId, RequestStatus status);

}
