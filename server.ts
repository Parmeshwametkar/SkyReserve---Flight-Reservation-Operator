import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
    return null;
  }
};

// Seed Data for Flights
const INITIAL_FLIGHTS = [
  {
    id: "FL-101",
    flightNumber: "SR-101",
    airline: "SkyReserve Airlines",
    airlineCode: "SR",
    source: "New York (JFK)",
    sourceCode: "JFK",
    destination: "London (LHR)",
    destinationCode: "LHR",
    departureTime: "08:30 AM",
    arrivalTime: "08:45 PM",
    duration: "7h 15m",
    stops: 0,
    layovers: [] as string[],
    fare: 450,
    discount: 50,
    class: "Economy",
    seatsAvailable: 42,
    carbonEmission: "180 kg CO2",
    baggage: "1 Cabin (7kg) + 2 Checked (23kg each)",
    refundable: true,
  },
  {
    id: "FL-102",
    flightNumber: "SR-302",
    airline: "SkyReserve Airlines",
    airlineCode: "SR",
    source: "London (LHR)",
    sourceCode: "LHR",
    destination: "Mumbai (BOM)",
    destinationCode: "BOM",
    departureTime: "10:15 AM",
    arrivalTime: "11:30 PM",
    duration: "8h 45m",
    stops: 0,
    layovers: [] as string[],
    fare: 620,
    discount: 30,
    class: "Economy",
    seatsAvailable: 28,
    carbonEmission: "220 kg CO2",
    baggage: "1 Cabin (7kg) + 1 Checked (23kg)",
    refundable: true,
  },
  {
    id: "FL-103",
    flightNumber: "JG-789",
    airline: "JetGlide Express",
    airlineCode: "JG",
    source: "Mumbai (BOM)",
    sourceCode: "BOM",
    destination: "Dubai (DXB)",
    destinationCode: "DXB",
    departureTime: "04:15 PM",
    arrivalTime: "06:00 PM",
    duration: "3h 15m",
    stops: 0,
    layovers: [] as string[],
    fare: 280,
    discount: 15,
    class: "Economy",
    seatsAvailable: 15,
    carbonEmission: "90 kg CO2",
    baggage: "1 Cabin (7kg) + 1 Checked (15kg)",
    refundable: false,
  },
  {
    id: "FL-104",
    flightNumber: "AP-440",
    airline: "AeroPremium",
    airlineCode: "AP",
    source: "Singapore (SIN)",
    sourceCode: "SIN",
    destination: "Tokyo (HND)",
    destinationCode: "HND",
    departureTime: "11:55 PM",
    arrivalTime: "07:30 AM",
    duration: "6h 35m",
    stops: 1,
    layovers: ["Hong Kong (HKG)"],
    fare: 890,
    discount: 100,
    class: "Business",
    seatsAvailable: 8,
    carbonEmission: "320 kg CO2",
    baggage: "2 Cabin (10kg each) + 2 Checked (32kg each)",
    refundable: true,
  },
  {
    id: "FL-105",
    flightNumber: "OW-650",
    airline: "OceanWinds",
    airlineCode: "OW",
    source: "Paris (CDG)",
    sourceCode: "CDG",
    destination: "Sydney (SYD)",
    destinationCode: "SYD",
    departureTime: "02:00 PM",
    arrivalTime: "06:30 AM",
    duration: "21h 30m",
    stops: 2,
    layovers: ["Singapore (SIN)", "Dubai (DXB)"],
    fare: 1450,
    discount: 120,
    class: "Economy",
    seatsAvailable: 55,
    carbonEmission: "540 kg CO2",
    baggage: "1 Cabin (7kg) + 2 Checked (23kg each)",
    refundable: true,
  },
  {
    id: "FL-106",
    flightNumber: "SR-202",
    airline: "SkyReserve Airlines",
    airlineCode: "SR",
    source: "New York (JFK)",
    sourceCode: "JFK",
    destination: "Dubai (DXB)",
    destinationCode: "DXB",
    departureTime: "09:00 PM",
    arrivalTime: "06:15 PM",
    duration: "13h 15m",
    stops: 1,
    layovers: ["London (LHR)"],
    fare: 950,
    discount: 80,
    class: "Premium Economy",
    seatsAvailable: 19,
    carbonEmission: "380 kg CO2",
    baggage: "1 Cabin (10kg) + 2 Checked (23kg each)",
    refundable: true,
  },
];

// In-Memory Database collections
let flights = [...INITIAL_FLIGHTS];
let bookings = [
  {
    id: "BK-9021",
    pnr: "SQR458",
    flightId: "FL-101",
    flightNumber: "SR-101",
    airline: "SkyReserve Airlines",
    source: "New York (JFK)",
    sourceCode: "JFK",
    destination: "London (LHR)",
    destinationCode: "LHR",
    departureTime: "08:30 AM",
    arrivalTime: "08:45 PM",
    passengers: [
      {
        name: "John Doe",
        passportNumber: "N3820192",
        nationality: "American",
        seat: "12A",
        mealPreference: "Vegetarian",
        specialAssistance: "None",
      }
    ],
    class: "Economy",
    fare: 450,
    discount: 50,
    taxes: 45,
    totalFare: 445,
    paymentMethod: "Credit Card",
    status: "Upcoming",
    bookingDate: "2026-07-02",
  }
];

let notifications = [
  {
    id: "N-1",
    type: "delay",
    title: "Flight Delay Advisory",
    message: "Flight SR-101 from JFK to LHR has a minor weather delay. Updated boarding time: 08:10 AM at Gate B4.",
    time: "10m ago",
    unread: true,
  },
  {
    id: "N-2",
    type: "gate",
    title: "Gate Change Notification",
    message: "Flight JG-789 to Dubai has changed gate from A12 to A18. Please proceed to Terminal 2.",
    time: "1h ago",
    unread: false,
  },
  {
    id: "N-3",
    type: "offer",
    title: "Monsoon Gateway Sale!",
    message: "Use code SKYFLY30 to get 30% off on Mumbai routes.",
    time: "1 day ago",
    unread: false,
  }
];

let pricingRules = [
  { id: "PR-1", name: "High Occupancy Increase", criteria: "Occupancy > 80%", markup: "+15%", active: true },
  { id: "PR-2", name: "Last Minute Premium", criteria: "Days to Departure < 3", markup: "+25%", active: true },
  { id: "PR-3", name: "Midweek Off-Peak Discount", criteria: "Departure is Tue/Wed", markup: "-10%", active: false },
];

let auditLogs = [
  { id: "LOG-101", user: "admin@skyreserve.com", action: "UPDATE_FLIGHT_PRICE", details: "Changed FL-101 base price to $450", timestamp: "2026-07-04 09:30 AM" },
  { id: "LOG-102", user: "operator@skyreserve.com", action: "CREW_ASSIGNMENT", details: "Assigned Cabin Crew Team B to FL-102", timestamp: "2026-07-04 10:15 AM" },
  { id: "LOG-103", user: "system@skyreserve.com", action: "DYNAMIC_PRICING_TRIGGER", details: "Triggered premium markup for FL-103 due to high occupancy", timestamp: "2026-07-04 11:00 AM" },
];

// Helper: Seeded Java code files contents
const JAVA_FILES = {
  "SkyReserveApplication.java": `package com.skyreserve;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class SkyReserveApplication {
    public static void main(String[] args) {
        SpringApplication.run(SkyReserveApplication.class, args);
    }
}`,
  "SecurityConfig.java": `package com.skyreserve.config;

import com.skyreserve.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/operator/**").hasAnyRole("OPERATOR", "ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}`,
  "JwtTokenProvider.java": `package com.skyreserve.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    @Value("\${jwt.secret}")
    private String jwtSecret;

    @Value("\${jwt.expiration-ms}")
    private long jwtExpirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities());
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}`,
  "FlightController.java": `package com.skyreserve.controller;

import com.skyreserve.dto.FlightSearchRequest;
import com.skyreserve.entity.Flight;
import com.skyreserve.service.FlightService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*")
public class FlightController {

    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @PostMapping("/search")
    public ResponseEntity<List<Flight>> searchFlights(@Valid @RequestBody FlightSearchRequest request) {
        List<Flight> results = flightService.searchFlights(request);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable String id) {
        return flightService.getFlightById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Flight> createFlight(@Valid @RequestBody Flight flight) {
        return ResponseEntity.ok(flightService.saveFlight(flight));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Flight> updateFlight(@PathVariable String id, @Valid @RequestBody Flight flight) {
        flight.setId(id);
        return ResponseEntity.ok(flightService.saveFlight(flight));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable String id) {
        flightService.deleteFlight(id);
        return ResponseEntity.noContent().build();
    }
}`,
  "FlightService.java": `package com.skyreserve.service;

import com.skyreserve.dto.FlightSearchRequest;
import com.skyreserve.entity.Flight;
import com.skyreserve.repository.FlightRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FlightService {

    private final FlightRepository flightRepository;

    public FlightService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    @Cacheable(value = "flightsSearch", key = "#request.toString()")
    public List<Flight> searchFlights(FlightSearchRequest request) {
        return flightRepository.findFlights(
                request.getSource(),
                request.getDestination(),
                request.getDepartureDate(),
                request.getTravelClass()
        );
    }

    @Cacheable(value = "flights", key = "#id")
    public Optional<Flight> getFlightById(String id) {
        return flightRepository.findById(id);
    }

    @CacheEvict(value = {"flights", "flightsSearch"}, allEntries = true)
    public Flight saveFlight(Flight flight) {
        return flightRepository.save(flight);
    }

    @CacheEvict(value = {"flights", "flightsSearch"}, allEntries = true)
    public void deleteFlight(String id) {
        flightRepository.deleteById(id);
    }
}`,
  "FlightRepository.java": `package com.skyreserve.repository;

import com.skyreserve.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, String> {

    @Query("SELECT f FROM Flight f WHERE f.sourceCode = :source AND f.destinationCode = :destination " +
           "AND f.departureDate = :depDate AND f.travelClass = :tClass AND f.seatsAvailable > 0")
    List<Flight> findFlights(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("depDate") LocalDate depDate,
            @Param("tClass") String tClass
    );
}`,
  "Flight.java": `package com.skyreserve.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "flights")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flight {

    @Id
    private String id;

    @Column(nullable = false)
    private String flightNumber;

    @Column(nullable = false)
    private String airline;

    @Column(nullable = false)
    private String airlineCode;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String sourceCode;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private String destinationCode;

    @Column(nullable = false)
    private LocalDate departureDate;

    @Column(nullable = false)
    private LocalTime departureTime;

    @Column(nullable = false)
    private LocalTime arrivalTime;

    @Column(nullable = false)
    private String duration;

    private int stops;

    @Column(nullable = false)
    private double baseFare;

    @Column(nullable = false)
    private int seatsAvailable;

    private String carbonEmission;

    private String baggagePolicy;

    private boolean refundable;
}`,
  "schema.sql": `-- PostreSQL Production Schema for SkyReserve Operator
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    full_name VARCHAR(100),
    frequent_flyer_num VARCHAR(30)
);

CREATE TABLE flights (
    id VARCHAR(50) PRIMARY KEY,
    flight_number VARCHAR(15) NOT NULL,
    airline VARCHAR(50) NOT NULL,
    airline_code VARCHAR(5) NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_code VARCHAR(10) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    destination_code VARCHAR(10) NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration VARCHAR(20) NOT NULL,
    stops INT DEFAULT 0,
    base_fare DECIMAL(10,2) NOT NULL,
    seats_available INT NOT NULL,
    carbon_emission VARCHAR(30),
    baggage_policy TEXT,
    refundable BOOLEAN DEFAULT TRUE
);

CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    pnr VARCHAR(10) UNIQUE NOT NULL,
    user_id VARCHAR(50) REFERENCES users(id),
    flight_id VARCHAR(50) REFERENCES flights(id),
    travel_class VARCHAR(20) NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    taxes DECIMAL(10,2) NOT NULL,
    total_fare DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30),
    status VARCHAR(20) DEFAULT 'Upcoming',
    booking_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE passengers (
    id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    passport_number VARCHAR(30),
    nationality VARCHAR(50),
    seat_number VARCHAR(10) NOT NULL,
    meal_preference VARCHAR(30),
    special_assistance VARCHAR(50)
);`
};

// API Endpoints
app.get("/api/flights", (req, res) => {
  const { source, destination, class: tClass } = req.query;
  let results = [...flights];

  if (source) {
    const s = String(source).toLowerCase();
    results = results.filter(f => f.source.toLowerCase().includes(s) || f.sourceCode.toLowerCase().includes(s));
  }
  if (destination) {
    const d = String(destination).toLowerCase();
    results = results.filter(f => f.destination.toLowerCase().includes(d) || f.destinationCode.toLowerCase().includes(d));
  }
  if (tClass) {
    results = results.map(f => ({
      ...f,
      class: String(tClass),
      fare: String(tClass) === "Business" ? f.fare * 2.2 : String(tClass) === "First Class" ? f.fare * 4.5 : String(tClass) === "Premium Economy" ? f.fare * 1.4 : f.fare
    }));
  }
  res.json(results);
});

app.post("/api/flights", (req, res) => {
  const newFlight = {
    ...req.body,
    id: `FL-${Math.floor(100 + Math.random() * 900)}`,
  };
  flights.push(newFlight);
  auditLogs.unshift({
    id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
    user: "operator@skyreserve.com",
    action: "CREATE_FLIGHT",
    details: `Created new flight ${newFlight.flightNumber} (${newFlight.sourceCode} -> ${newFlight.destinationCode})`,
    timestamp: new Date().toLocaleString(),
  });
  res.json({ success: true, flight: newFlight });
});

app.put("/api/flights/:id", (req, res) => {
  const { id } = req.params;
  const idx = flights.findIndex(f => f.id === id);
  if (idx !== -1) {
    flights[idx] = { ...flights[idx], ...req.body };
    auditLogs.unshift({
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      user: "operator@skyreserve.com",
      action: "UPDATE_FLIGHT",
      details: `Modified flight parameters for ${flights[idx].flightNumber}`,
      timestamp: new Date().toLocaleString(),
    });
    res.json({ success: true, flight: flights[idx] });
  } else {
    res.status(404).json({ error: "Flight not found" });
  }
});

app.delete("/api/flights/:id", (req, res) => {
  const { id } = req.params;
  const flight = flights.find(f => f.id === id);
  if (flight) {
    flights = flights.filter(f => f.id !== id);
    auditLogs.unshift({
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      user: "admin@skyreserve.com",
      action: "DELETE_FLIGHT",
      details: `Removed flight scheduling for ${flight.flightNumber}`,
      timestamp: new Date().toLocaleString(),
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Flight not found" });
  }
});

app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

app.post("/api/bookings", (req, res) => {
  const { flightId, passengers, selectedClass, baseFare, discount, totalFare, paymentMethod } = req.body;
  const flight = flights.find(f => f.id === flightId);

  if (!flight) {
    return res.status(404).json({ error: "Flight target not found" });
  }

  const pnr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newBooking = {
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    pnr,
    flightId,
    flightNumber: flight.flightNumber,
    airline: flight.airline,
    source: flight.source,
    sourceCode: flight.sourceCode,
    destination: flight.destination,
    destinationCode: flight.destinationCode,
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    passengers,
    class: selectedClass || "Economy",
    fare: baseFare,
    discount: discount || 0,
    taxes: Math.floor(baseFare * 0.1),
    totalFare,
    paymentMethod: paymentMethod || "Credit Card",
    status: "Upcoming",
    bookingDate: new Date().toISOString().split('T')[0],
  };

  bookings.unshift(newBooking);

  // Decrement seat counts
  flight.seatsAvailable = Math.max(0, flight.seatsAvailable - passengers.length);

  // Add system alert
  notifications.unshift({
    id: `N-${Math.floor(100 + Math.random() * 900)}`,
    type: "offer",
    title: "Booking Confirmed!",
    message: `Your booking for flight ${flight.flightNumber} to ${flight.destinationCode} is confirmed. PNR: ${pnr}`,
    time: "Just now",
    unread: true,
  });

  res.json({ success: true, booking: newBooking });
});

app.post("/api/bookings/:id/cancel", (req, res) => {
  const { id } = req.params;
  const booking = bookings.find(b => b.id === id);
  if (booking) {
    booking.status = "Cancelled";
    // Refund seats
    const flight = flights.find(f => f.id === booking.flightId);
    if (flight) {
      flight.seatsAvailable += booking.passengers.length;
    }
    res.json({ success: true, booking });
  } else {
    res.status(404).json({ error: "Booking not found" });
  }
});

app.get("/api/notifications", (req, res) => {
  res.json(notifications);
});

app.post("/api/notifications/read", (req, res) => {
  notifications = notifications.map(n => ({ ...n, unread: false }));
  res.json({ success: true });
});

app.get("/api/pricing-rules", (req, res) => {
  res.json(pricingRules);
});

app.post("/api/pricing-rules", (req, res) => {
  const newRule = { ...req.body, id: `PR-${Math.floor(100 + Math.random() * 900)}` };
  pricingRules.push(newRule);
  res.json({ success: true, rule: newRule });
});

app.delete("/api/pricing-rules/:id", (req, res) => {
  pricingRules = pricingRules.filter(r => r.id !== req.params.id);
  res.json({ success: true });
});

app.get("/api/audit-logs", (req, res) => {
  res.json(auditLogs);
});

app.get("/api/java-code", (req, res) => {
  res.json(JAVA_FILES);
});

// AI endpoints using Google Gemini (with deterministic fallbacks)
app.post("/api/ai/predict-fare", async (req, res) => {
  const { source, destination, date } = req.body;
  const client = getGenAIClient();

  if (!client) {
    // Graceful fallback: Deterministic AI model simulations
    const seed = (source?.charCodeAt(0) || 0) + (destination?.charCodeAt(0) || 0);
    const trend = seed % 3 === 0 ? "Increasing" : seed % 3 === 1 ? "Decreasing" : "Stable";
    const recommendation = trend === "Decreasing" ? "Book Now" : "Wait for drop";
    const predictedFare = 300 + (seed % 10) * 45;
    const confidence = 85 + (seed % 15);

    return res.json({
      predictedFare,
      trend,
      confidence: `${confidence}%`,
      recommendation,
      bestTimeToBook: "3 weeks from now",
      aiAnalysis: `Simulation Engine predicts ${trend.toLowerCase()} pricing trend between ${source || "JFK"} and ${destination || "LHR"} for ${date || "upcoming seasons"}. Air Traffic volumes are normal.`
    });
  }

  try {
    const prompt = `Analyze flight routes and pricing trends to provide a fare prediction.
    Route: from ${source} to ${destination} around date ${date}.
    Provide a JSON response containing:
    {
      "predictedFare": number (typical market fare),
      "trend": "Increasing" | "Decreasing" | "Stable",
      "confidence": "XX%" (confidence score),
      "recommendation": "Book Now" | "Wait" | "Monitor",
      "bestTimeToBook": string,
      "aiAnalysis": string (brief professional 2-sentence market explanation)
    }
    Respond ONLY with raw JSON. No markdown code blocks, no backticks.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "{}";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanedText);
    res.json(result);
  } catch (error) {
    console.error("AI Fare Prediction Error:", error);
    res.status(500).json({ error: "Gemini calculation failed, try again later." });
  }
});

app.post("/api/ai/recommend-routes", async (req, res) => {
  const { preferences, budget, durationDays } = req.body;
  const client = getGenAIClient();

  if (!client) {
    // Fallback Mock Route recommendations
    return res.json([
      {
        destination: "Tokyo (HND)",
        matchScore: "96%",
        estimatedFare: "$890",
        whyRecommended: "Perfect match for shopping, tech, and gourmet preferences. Direct flights available this weekend.",
        localWeather: "Sunny, 24°C",
      },
      {
        destination: "London (LHR)",
        matchScore: "91%",
        estimatedFare: "$450",
        whyRecommended: "Historical museums and cultural highlights fit your requirements with low airfares.",
        localWeather: "Cloudy, 18°C",
      },
    ]);
  }

  try {
    const prompt = `Recommend 3 tailored international flight destinations.
    Preferences: ${preferences}. Budget: $${budget || "1000"}. Duration: ${durationDays || "7"} days.
    Provide a JSON response containing a list of objects, each having:
    {
      "destination": string,
      "matchScore": string (e.g. "95%"),
      "estimatedFare": string,
      "whyRecommended": string,
      "localWeather": string
    }
    Respond ONLY with raw JSON, no markdown formatting.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "[]";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    res.status(500).json({ error: "Failed to load dynamic travel AI advice." });
  }
});

app.post("/api/ai/delay-prediction", async (req, res) => {
  const { flightNumber, airport } = req.body;
  const client = getGenAIClient();

  if (!client) {
    const hash = (flightNumber?.charCodeAt(1) || 12) + (airport?.charCodeAt(0) || 5);
    const delayProb = 5 + (hash % 45);
    const riskFactor = delayProb > 30 ? "Medium Risk" : "Low Risk";
    const primaryReason = delayProb > 30 ? "Incoming airspace queue congestion" : "Excellent clear terminal weather conditions";

    return res.json({
      probability: `${delayProb}%`,
      riskLevel: riskFactor,
      reason: primaryReason,
      meteorologicalBrief: "Terminal operations: wind speed 8kt, visibility clear, temp 22°C."
    });
  }

  try {
    const prompt = `Provide an aviation delay risk assessment.
    Flight Number: ${flightNumber}, Airport: ${airport}.
    Provide a JSON response:
    {
      "probability": "XX%",
      "riskLevel": "Low" | "Medium" | "High",
      "reason": string,
      "meteorologicalBrief": string
    }
    Respond ONLY with raw JSON.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "{}";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error("AI Delay Predictor Error:", error);
    res.status(500).json({ error: "Gemini failed to evaluate route risk factors." });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  const { message, history } = req.body;
  const client = getGenAIClient();

  if (!client) {
    // Smart offline conversational assistant
    const lower = message.toLowerCase();
    let reply = "I am SkyReserve's AI Co-Pilot. I can help you find flights, predict pricing trends, check seat availability, or guide you through operator controls.";
    if (lower.includes("hello") || lower.includes("hi")) {
      reply = "Welcome aboard! How can I assist you with your flight reservations or operator dashboard controls today?";
    } else if (lower.includes("price") || lower.includes("cheap")) {
      reply = "To check price predictions, head over to the Search tab, choose JFK to LHR, and click 'Predict Pricing Trends' to see Gemini forecast the costs!";
    } else if (lower.includes("seat") || lower.includes("booking")) {
      reply = "You can interactively reserve Economy, Premium Economy, Business, or First class seats on our Seat Selection map during checkout.";
    } else if (lower.includes("java") || lower.includes("spring")) {
      reply = "To browse our enterprise Spring Boot microservice code, switch your portal role to 'Admin Portal' in the header and click 'Java Enterprise Architecture'.";
    }

    return res.json({ reply });
  }

  try {
    const formattedHistory = (history || []).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    }));

    const chat = client.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: "You are SkyReserve's premium Enterprise Flight Assistant. Be helpful, professional, clear, and brief. Guide the user regarding flight availability, premium boarding options, security gate adjustments, and Spring Boot enterprise controllers.",
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message });
    res.json({ reply: response.text });
  } catch (error) {
    console.error("AI Chat Assistant Error:", error);
    res.status(500).json({ error: "Failed to connect to the Gemini server assistant." });
  }
});

// Setup Vite Dev Server / Static Asset Hosting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkyReserve premium full-stack server listening at http://localhost:${PORT}`);
  });
}

startServer();
