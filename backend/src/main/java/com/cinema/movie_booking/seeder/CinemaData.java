package com.cinema.movie_booking.seeder;

/**
 * Simple data holder for cinema seed data.
 */
public class CinemaData {
    public final String name;
    public final String address;
    public final String city;
    public final String district;
    public final String phone;
    public final String email;

    public CinemaData(String name, String address, String city,
                      String district, String phone, String email) {
        this.name     = name;
        this.address  = address;
        this.city     = city;
        this.district = district;
        this.phone    = phone;
        this.email    = email;
    }
}
