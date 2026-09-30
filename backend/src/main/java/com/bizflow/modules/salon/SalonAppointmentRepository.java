package com.bizflow.modules.salon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalonAppointmentRepository extends JpaRepository<SalonAppointment, Long> {
    List<SalonAppointment> findByBusinessIdAndAppointmentDateOrderByStartTimeAsc(Long businessId, LocalDate appointmentDate);
    List<SalonAppointment> findByBusinessIdAndAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(Long businessId, LocalDate start, LocalDate end);
    List<SalonAppointment> findByBusinessIdAndCustomerPhoneOrderByAppointmentDateDesc(Long businessId, String customerPhone);
    List<SalonAppointment> findByBusinessIdOrderByAppointmentDateDescStartTimeDesc(Long businessId);
    Optional<SalonAppointment> findByIdAndBusinessId(Long id, Long businessId);
}
