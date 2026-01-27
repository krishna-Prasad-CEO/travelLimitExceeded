package com.travelbuddy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trip_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;
    private Long userId;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;
    private java.time.LocalDateTime requestedAt;
}
