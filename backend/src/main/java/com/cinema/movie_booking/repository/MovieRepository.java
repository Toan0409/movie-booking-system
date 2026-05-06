package com.cinema.movie_booking.repository;

import com.cinema.movie_booking.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Movie entity
 * Ho tro soft delete va cac query tuy chinh
 */
@Repository
public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie> {

    // Tim tat ca phim chua bi xoa (mac dinh)
    List<Movie> findByIsDeletedFalse();

    // Tim tat ca phim chua bi xoa co phan trang
    Page<Movie> findByIsDeletedFalse(Pageable pageable);

    // Tim phim theo ID va chua bi xoa
    Optional<Movie> findByMovieIdAndIsDeletedFalse(Long movieId);

    // Tim phim dang chieu va chua bi xoa
    List<Movie> findByIsNowShowingTrueAndIsDeletedFalse();

    // Tim phim dang chieu co phan trang
    Page<Movie> findByIsNowShowingTrueAndIsDeletedFalse(Pageable pageable);

    // Tim phim sap chieu va chua bi xoa
    List<Movie> findByIsComingSoonTrueAndIsDeletedFalse();

    // Tim phim sap chieu co phan trang
    Page<Movie> findByIsComingSoonTrueAndIsDeletedFalse(Pageable pageable);

    // Tim phim noi bat va chua bi xoa
    List<Movie> findByIsFeaturedTrueAndIsDeletedFalse();

    // Tim phim noi bat co phan trang
    Page<Movie> findByIsFeaturedTrueAndIsDeletedFalse(Pageable pageable);

    // Tim phim theo the loai va chua bi xoa
    List<Movie> findByGenreGenreIdAndIsDeletedFalse(Long genreId);

    // Tim phim theo the loai co phan trang
    Page<Movie> findByGenreGenreIdAndIsDeletedFalse(Long genreId, Pageable pageable);

    // Tim kiem phim theo ten (khong phan biet hoa thuong)
    @Query("SELECT m FROM Movie m WHERE m.isDeleted = false AND " +
            "(LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.originalTitle) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Movie> searchByTitle(@Param("keyword") String keyword);

    // Tim kiem phim theo ten co phan trang
    @Query("SELECT m FROM Movie m WHERE m.isDeleted = false AND " +
            "(LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.originalTitle) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Movie> searchByTitle(@Param("keyword") String keyword, Pageable pageable);

    // Soft delete - danh dau phim la da xoa
    @Modifying
    @Query("UPDATE Movie m SET m.isDeleted = true WHERE m.movieId = :id")
    void softDelete(@Param("id") Long id);

    // Kiem tra phim ton tai va chua bi xoa
    boolean existsByMovieIdAndIsDeletedFalse(Long movieId);

    // Dem so phim chua bi xoa
    long countByIsDeletedFalse();

    boolean existsByTitleAndIsDeletedFalse(String title);
}
