package com.travelbuddy.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String departurePlace;

    private String arrivalPlace;

    private LocalDate departureDate;

    private Long riderId; // user who created the trip

    private int maxSeats;
}
