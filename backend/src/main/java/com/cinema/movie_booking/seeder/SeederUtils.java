package com.cinema.movie_booking.seeder;

import com.cinema.movie_booking.enums.TheaterType;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * Utility methods shared across the DataSeeder.
 */
@Slf4j
public final class SeederUtils {

    private static final Random RANDOM = new Random();

    private static final LocalTime[] ALL_SLOTS = {
            LocalTime.of(9, 0),
            LocalTime.of(11, 30),
            LocalTime.of(14, 0),
            LocalTime.of(16, 30),
            LocalTime.of(19, 0),
            LocalTime.of(21, 30)
    };

    private SeederUtils() {
    }

    // ── Date ─────────────────────────────────────────────────────────────────

    /**
     * Parse a date string in format "yyyy-MM-dd". Returns null on failure.
     */
    public static LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank())
            return null;
        try {
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            log.warn("[SeederUtils] Could not parse date: '{}'", dateStr);
            return null;
        }
    }

    // ── String ────────────────────────────────────────────────────────────────

    /**
     * Truncate a string to maxLength characters. Returns null if input is null.
     */
    public static String truncate(String text, int maxLength) {
        if (text == null)
            return null;
        return text.length() <= maxLength ? text : text.substring(0, maxLength);
    }

    /**
     * Extract a simplified nationality from a "place_of_birth" string.
     * E.g. "Los Angeles, California, USA" -> "USA"
     */
    public static String extractNationality(String placeOfBirth) {
        if (placeOfBirth == null || placeOfBirth.isBlank())
            return null;
        String[] parts = placeOfBirth.split(",");
        return parts[parts.length - 1].trim();
    }

    // ── Random ────────────────────────────────────────────────────────────────

    /**
     * Generate a random realistic movie runtime (90-160 minutes).
     */
    public static int randomRuntime() {
        return 90 + RANDOM.nextInt(71);
    }

    /**
     * Pick n random theaters from the list (without replacement).
     * If n >= list size, returns a shuffled copy of the full list.
     */
    public static <T> List<T> pickRandom(List<T> source, int n) {
        if (source == null || source.isEmpty())
            return Collections.emptyList();
        List<T> copy = new ArrayList<>(source);
        Collections.shuffle(copy, RANDOM);
        return copy.subList(0, Math.min(n, copy.size()));
    }

    /**
     * Pick n random showtime slots from the predefined slot list.
     */
    public static LocalTime[] pickRandomSlots(int n) {
        List<LocalTime> slotList = new ArrayList<>(List.of(ALL_SLOTS));
        Collections.shuffle(slotList, RANDOM);
        int count = Math.min(n, slotList.size());
        LocalTime[] result = new LocalTime[count];
        for (int i = 0; i < count; i++) {
            result[i] = slotList.get(i);
        }
        return result;
    }

    /**
     * Return the base ticket price for a given theater type.
     * STANDARD = 80,000 VND, VIP = 120,000 VND, IMAX = 150,000 VND
     */
    public static double basePriceFor(TheaterType type) {
        if (type == null)
            return 80_000.0;
        return switch (type) {
            case VIP -> 120_000.0;
            case IMAX -> 150_000.0;
            case FOUR_DX -> 180_000.0;
            default -> 80_000.0;
        };
    }
}
