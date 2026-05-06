package com.cinema.movie_booking.seeder;

import com.cinema.movie_booking.enums.TheaterType;

/**
 * Simple data holder for theater configuration during seeding.
 */
public class TheaterConfig {
    public final String name;
    public final TheaterType type;
    public final int rows;
    public final int seatsPerRow;

    public TheaterConfig(String name, TheaterType type, int rows, int seatsPerRow) {
        this.name = name;
        this.type = type;
        this.rows = rows;
        this.seatsPerRow = seatsPerRow;
    }
}
