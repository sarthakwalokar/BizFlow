package com.bizflow.modules.repair;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.modules.repair.RepairDtos.*;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RepairService {

    private final RepairJobCardRepository jobCardRepository;
    private final BusinessRepository businessRepository;

    @Transactional(readOnly = true)
    public List<JobCardDto> getJobCards(String search, String status) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<RepairJobCard> list;
        if (search != null && !search.trim().isEmpty()) {
            list = jobCardRepository.searchJobCards(businessId, search.trim());
        } else if (status != null && !status.trim().isEmpty()) {
            list = jobCardRepository.findByBusinessIdAndStatusOrderByCreatedAtDesc(businessId, status.trim());
        } else {
            list = jobCardRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        }
        return list.stream().map(this::mapJobCardToDto).collect(Collectors.toList());
    }

    @Transactional
    public JobCardDto createJobCard(CreateJobCardRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        String jobNum = "JOB-" + (System.currentTimeMillis() % 1000000);

        LocalDate estDate = request.getEstimatedCompletionDate() != null
                ? LocalDate.parse(request.getEstimatedCompletionDate())
                : LocalDate.now().plusDays(3);

        BigDecimal estCost = request.getTotalEstimatedCost() != null ? request.getTotalEstimatedCost() : BigDecimal.ZERO;

        RepairJobCard job = RepairJobCard.builder()
                .business(business)
                .jobCardNumber(jobNum)
                .customerName(request.getCustomerName().trim())
                .customerPhone(request.getCustomerPhone().trim())
                .customerEmail(request.getCustomerEmail())
                .itemType(request.getItemType() != null ? request.getItemType().trim() : "General Device")
                .brand(request.getBrand() != null ? request.getBrand().trim() : "")
                .model(request.getModel() != null ? request.getModel().trim() : "")
                .serialOrImei(request.getSerialOrImei())
                .problemDescription(request.getProblemDescription().trim())
                .diagnosticNotes(request.getDiagnosticNotes())
                .workPerformed("")
                .partsCost(BigDecimal.ZERO)
                .labourCost(BigDecimal.ZERO)
                .totalEstimatedCost(estCost)
                .totalFinalCost(estCost)
                .assignedTechnician(request.getAssignedTechnician())
                .status("RECEIVED")
                .priority(request.getPriority() != null ? request.getPriority() : "NORMAL")
                .estimatedCompletionDate(estDate)
                .paymentStatus("PENDING")
                .build();

        return mapJobCardToDto(jobCardRepository.save(job));
    }

    @Transactional
    public JobCardDto updateJobCard(Long id, UpdateJobCardRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RepairJobCard job = jobCardRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Job card not found"));

        if (request.getDiagnosticNotes() != null) job.setDiagnosticNotes(request.getDiagnosticNotes());
        if (request.getWorkPerformed() != null) job.setWorkPerformed(request.getWorkPerformed());
        if (request.getPartsCost() != null) job.setPartsCost(request.getPartsCost());
        if (request.getLabourCost() != null) job.setLabourCost(request.getLabourCost());

        if (request.getTotalFinalCost() != null) {
            job.setTotalFinalCost(request.getTotalFinalCost());
        } else if (request.getPartsCost() != null || request.getLabourCost() != null) {
            BigDecimal parts = job.getPartsCost() != null ? job.getPartsCost() : BigDecimal.ZERO;
            BigDecimal labour = job.getLabourCost() != null ? job.getLabourCost() : BigDecimal.ZERO;
            job.setTotalFinalCost(parts.add(labour));
        }

        if (request.getAssignedTechnician() != null) job.setAssignedTechnician(request.getAssignedTechnician());
        if (request.getPriority() != null) job.setPriority(request.getPriority());
        if (request.getPaymentStatus() != null) job.setPaymentStatus(request.getPaymentStatus());

        if (request.getStatus() != null) {
            job.setStatus(request.getStatus());
            if ("DELIVERED".equalsIgnoreCase(request.getStatus()) && job.getDeliveryDate() == null) {
                job.setDeliveryDate(Instant.now());
            }
        }

        return mapJobCardToDto(jobCardRepository.save(job));
    }

    @Transactional(readOnly = true)
    public List<JobCardDto> getCustomerRepairHistory(String phone) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        return jobCardRepository.findByBusinessIdAndCustomerPhoneOrderByCreatedAtDesc(businessId, phone)
                .stream().map(this::mapJobCardToDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteJobCard(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        RepairJobCard job = jobCardRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Job card not found"));
        jobCardRepository.delete(job);
    }

    private JobCardDto mapJobCardToDto(RepairJobCard job) {
        return JobCardDto.builder()
                .id(job.getId())
                .jobCardNumber(job.getJobCardNumber())
                .customerName(job.getCustomerName())
                .customerPhone(job.getCustomerPhone())
                .customerEmail(job.getCustomerEmail())
                .itemType(job.getItemType())
                .brand(job.getBrand())
                .model(job.getModel())
                .serialOrImei(job.getSerialOrImei())
                .problemDescription(job.getProblemDescription())
                .diagnosticNotes(job.getDiagnosticNotes())
                .workPerformed(job.getWorkPerformed())
                .partsCost(job.getPartsCost())
                .labourCost(job.getLabourCost())
                .totalEstimatedCost(job.getTotalEstimatedCost())
                .totalFinalCost(job.getTotalFinalCost())
                .assignedTechnician(job.getAssignedTechnician())
                .status(job.getStatus())
                .priority(job.getPriority())
                .estimatedCompletionDate(job.getEstimatedCompletionDate())
                .deliveryDate(job.getDeliveryDate())
                .paymentStatus(job.getPaymentStatus())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
