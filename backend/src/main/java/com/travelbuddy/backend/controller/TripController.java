package com.travelbuddy.backend.controller;

import com.travelbuddy.backend.entity.Trip;
import com.travelbuddy.backend.entity.TripRequest;
import com.travelbuddy.backend.service.TripService;
import com.travelbuddy.backend.service.TripRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin
public class TripController {

    private final TripService tripService;
    private final TripRequestService tripRequestService; // ✅ ADDED for join request logic

    // ✅ Create a trip
    @PostMapping
    public Trip createTrip(@RequestBody Trip trip) {
        return tripService.createTrip(trip);
    }

    // ✅ Search trips (matching feature)
    @GetMapping("/search")
    public List<Trip> searchTrips(
            @RequestParam String departure,
            @RequestParam String arrival,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return tripService.searchTrips(departure, arrival, date);
    }

    // ✅ User sends JOIN REQUEST (status = PENDING)
    // 🔥 THIS replaces all previous join/request confusion
    @PostMapping("/{tripId}/join")
    public TripRequest joinTrip(@PathVariable Long tripId,
                                @RequestParam Long userId) {
        return tripRequestService.sendRequest(tripId, userId);
    }

    // ✅ Trip owner APPROVES a request
    @PostMapping("/requests/{requestId}/approve")
    public TripRequest approveRequest(@PathVariable Long requestId) {
        return tripRequestService.approveRequest(requestId);
    }

    // ✅ Trip owner REJECTS a request
    @PostMapping("/requests/{requestId}/reject")
    public TripRequest rejectRequest(@PathVariable Long requestId) {
        return tripRequestService.rejectRequest(requestId);
    }

    // ✅ View all requests for a specific trip (for owner dashboard)
    @GetMapping("/{tripId}/requests")
    public List<TripRequest> getTripRequests(@PathVariable Long tripId) {
        return tripRequestService.getRequestsForTrip(tripId);
    }

    // Rider dashboard — trips created by this rider
    @GetMapping("/rider/{riderId}")
    public List<Trip> getTripsByRider(@PathVariable Long riderId) {
        return tripService.getTripsByRider(riderId);
    }

    // User dashboard — trips user has joined (approved only)
    @GetMapping("/joined/{userId}")
    public List<TripRequest> getJoinedTrips(@PathVariable Long userId) {
        return tripRequestService.getApprovedTripsForUser(userId);
    }



}
