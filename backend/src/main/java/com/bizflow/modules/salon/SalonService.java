package com.bizflow.modules.salon;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.customer.Customer;
import com.bizflow.customer.CustomerRepository;
import com.bizflow.modules.salon.SalonDtos.*;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalonService {

    private final SalonServiceItemRepository serviceRepository;
    private final SalonAppointmentRepository appointmentRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<ServiceItemDto> getServices() {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        return serviceRepository.findByBusinessIdOrderByNameAsc(businessId)
                .stream().map(this::mapServiceToDto).collect(Collectors.toList());
    }

    @Transactional
    public ServiceItemDto createService(CreateServiceRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        SalonServiceItem service = SalonServiceItem.builder()
                .business(business)
                .name(request.getName().trim())
                .category(request.getCategory() != null ? request.getCategory().trim() : "General")
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 30)
                .price(request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO)
                .description(request.getDescription())
                .isActive(true)
                .build();

        return mapServiceToDto(serviceRepository.save(service));
    }

    @Transactional
    public ServiceItemDto updateService(Long id, CreateServiceRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        SalonServiceItem service = serviceRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        if (request.getName() != null) service.setName(request.getName().trim());
        if (request.getCategory() != null) service.setCategory(request.getCategory().trim());
        if (request.getDurationMinutes() != null) service.setDurationMinutes(request.getDurationMinutes());
        if (request.getPrice() != null) service.setPrice(request.getPrice());
        if (request.getDescription() != null) service.setDescription(request.getDescription());

        return mapServiceToDto(serviceRepository.save(service));
    }

    @Transactional
    public void deleteService(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        SalonServiceItem service = serviceRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        serviceRepository.delete(service);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> getAppointments(String date, String startDate, String endDate) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<SalonAppointment> list;

        if (date != null && !date.isEmpty()) {
            list = appointmentRepository.findByBusinessIdAndAppointmentDateOrderByStartTimeAsc(businessId, LocalDate.parse(date));
        } else if (startDate != null && endDate != null) {
            list = appointmentRepository.findByBusinessIdAndAppointmentDateBetweenOrderByAppointmentDateAscStartTimeAsc(
                    businessId, LocalDate.parse(startDate), LocalDate.parse(endDate));
        } else {
            list = appointmentRepository.findByBusinessIdOrderByAppointmentDateDescStartTimeDesc(businessId);
        }

        return list.stream().map(this::mapAppointmentToDto).collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDto createAppointment(CreateAppointmentRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findByIdAndBusinessId(request.getCustomerId(), businessId).orElse(null);
        }

        SalonServiceItem serviceItem = null;
        if (request.getServiceId() != null) {
            serviceItem = serviceRepository.findByIdAndBusinessId(request.getServiceId(), businessId).orElse(null);
        }

        LocalDate apptDate = request.getAppointmentDate() != null
                ? LocalDate.parse(request.getAppointmentDate())
                : LocalDate.now();

        SalonAppointment appointment = SalonAppointment.builder()
                .business(business)
                .customer(customer)
                .customerName(request.getCustomerName() != null ? request.getCustomerName().trim() : (customer != null ? customer.getName() : "Guest"))
                .customerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone().trim() : (customer != null ? customer.getPhone() : ""))
                .service(serviceItem)
                .serviceName(request.getServiceName() != null ? request.getServiceName() : (serviceItem != null ? serviceItem.getName() : "Custom Service"))
                .staffName(request.getStaffName())
                .appointmentDate(apptDate)
                .startTime(request.getStartTime() != null ? request.getStartTime() : "10:00 AM")
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : (serviceItem != null ? serviceItem.getDurationMinutes() : 30))
                .price(request.getPrice() != null ? request.getPrice() : (serviceItem != null ? serviceItem.getPrice() : BigDecimal.ZERO))
                .status("BOOKED")
                .notes(request.getNotes())
                .build();

        return mapAppointmentToDto(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDto updateAppointmentStatus(Long id, String status) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        SalonAppointment appt = appointmentRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        appt.setStatus(status);
        return mapAppointmentToDto(appointmentRepository.save(appt));
    }

    @Transactional(readOnly = true)
    public CustomerServiceHistoryDto getCustomerHistory(String phone) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<SalonAppointment> list = appointmentRepository.findByBusinessIdAndCustomerPhoneOrderByAppointmentDateDesc(businessId, phone);

        BigDecimal totalSpent = list.stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .map(SalonAppointment::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String customerName = list.isEmpty() ? "Customer" : list.get(0).getCustomerName();

        return CustomerServiceHistoryDto.builder()
                .customerName(customerName)
                .customerPhone(phone)
                .totalAppointments(list.size())
                .totalSpent(totalSpent)
                .pastAppointments(list.stream().map(this::mapAppointmentToDto).collect(Collectors.toList()))
                .build();
    }

    private ServiceItemDto mapServiceToDto(SalonServiceItem item) {
        return ServiceItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .category(item.getCategory())
                .durationMinutes(item.getDurationMinutes())
                .price(item.getPrice())
                .description(item.getDescription())
                .isActive(item.getIsActive())
                .createdAt(item.getCreatedAt())
                .build();
    }

    private AppointmentDto mapAppointmentToDto(SalonAppointment appt) {
        return AppointmentDto.builder()
                .id(appt.getId())
                .customerId(appt.getCustomer() != null ? appt.getCustomer().getId() : null)
                .customerName(appt.getCustomerName())
                .customerPhone(appt.getCustomerPhone())
                .serviceId(appt.getService() != null ? appt.getService().getId() : null)
                .serviceName(appt.getServiceName())
                .staffName(appt.getStaffName())
                .appointmentDate(appt.getAppointmentDate())
                .startTime(appt.getStartTime())
                .endTime(appt.getEndTime())
                .durationMinutes(appt.getDurationMinutes())
                .price(appt.getPrice())
                .status(appt.getStatus())
                .notes(appt.getNotes())
                .createdAt(appt.getCreatedAt())
                .build();
    }
}
