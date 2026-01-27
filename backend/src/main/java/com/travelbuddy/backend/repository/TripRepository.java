package com.travelbuddy.backend.repository;

import com.travelbuddy.backend.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    @Query("""
        SELECT t FROM Trip t
        WHERE LOWER(t.departurePlace) = LOWER(:departure)
        AND LOWER(t.arrivalPlace) = LOWER(:arrival)
        AND t.departureDate BETWEEN :startDate AND :endDate
    """)
    List<Trip> searchTrips(
            @Param("departure") String departure,
            @Param("arrival") String arrival,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<Trip> findByRiderId(Long riderId);

}
