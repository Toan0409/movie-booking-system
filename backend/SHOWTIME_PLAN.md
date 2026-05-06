# Showtime Management Module - Implementation Plan

## Status: ✅ COMPLETED

## Files Created

### 1. Repository Layer
- ✅ `src/main/java/com/cinema/movie_booking/repository/ShowtimeRepository.java`

### 2. DTO Layer
- ✅ `src/main/java/com/cinema/movie_booking/dto/showtime/ShowtimeRequestDTO.java`
- ✅ `src/main/java/com/cinema/movie_booking/dto/showtime/ShowtimeResponseDTO.java`

### 3. Mapper Layer
- ✅ `src/main/java/com/cinema/movie_booking/mapper/ShowtimeMapper.java`

### 4. Service Layer
- ✅ `src/main/java/com/cinema/movie_booking/service/ShowtimeService.java` (interface)
- ✅ `src/main/java/com/cinema/movie_booking/service/impl/ShowtimeServiceImpl.java`

### 5. Controller Layer
- ✅ `src/main/java/com/cinema/movie_booking/controller/admin/ShowtimeAdminController.java`
- ✅ `src/main/java/com/cinema/movie_booking/controller/client/ShowtimeController.java`

## Business Rules Implemented
1. ✅ Theater cannot have overlapping showtimes
2. ✅ Showtime must belong to one movie and one theater
3. ✅ Start time must be before end time
4. ✅ Showtime cannot be modified if tickets booked (check bookings)
5. ✅ Admin can deactivate instead of delete

## API Endpoints

### Admin APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/showtimes | Create showtime |
| PUT | /api/admin/showtimes/{id} | Update showtime |
| GET | /api/admin/showtimes/{id} | Get showtime by ID |
| GET | /api/admin/showtimes | List all showtimes (paginated) |
| GET | /api/admin/showtimes/active | List active showtimes |
| GET | /api/admin/showtimes/movie/{movieId} | Get by movie |
| GET | /api/admin/showtimes/theater/{theaterId} | Get by theater |
| GET | /api/admin/showtimes/date?date= | Get by date |
| DELETE | /api/admin/showtimes/{id} | Deactivate showtime |
| PATCH | /api/admin/showtimes/{id}/activate | Activate showtime |

### Client APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/client/showtimes/{id} | Get showtime by ID |
| GET | /api/client/showtimes | Get today's showtimes |
| GET | /api/client/showtimes/movie/{movieId} | Get by movie |
| GET | /api/client/showtimes/theater/{theaterId} | Get by theater |
| GET | /api/client/showtimes/date?date= | Get by date |
| GET | /api/client/showtimes/movie/{movieId}/date?date= | Get by movie and date |

## Integration Points (for future development)
1. **Seat Selection**: Showtime provides context for available seats
2. **Booking System**: Showtime links to bookings
3. **Payment System**: Showtime price used in payment calculation

