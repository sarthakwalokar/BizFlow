package com.bizflow.inventory.service;

import com.bizflow.business.Business;
import com.bizflow.business.BusinessRepository;
import com.bizflow.common.exception.BadRequestException;
import com.bizflow.common.exception.DuplicateResourceException;
import com.bizflow.common.exception.ResourceNotFoundException;
import com.bizflow.inventory.Location;
import com.bizflow.inventory.dto.LocationRequest;
import com.bizflow.inventory.dto.LocationResponse;
import com.bizflow.inventory.repository.LocationRepository;
import com.bizflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final BusinessRepository businessRepository;

    @Transactional(readOnly = true)
    public List<LocationResponse> getLocations(boolean activeOnly) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        List<Location> locations = activeOnly
                ? locationRepository.findByBusinessIdAndActiveTrueOrderByIdAsc(businessId)
                : locationRepository.findByBusinessIdOrderByIdAsc(businessId);

        return locations.stream().map(LocationResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public LocationResponse getLocationById(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Location location = locationRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", id));

        return LocationResponse.fromEntity(location);
    }

    @Transactional
    public LocationResponse createLocation(LocationRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        String name = request.getName().trim();

        if (locationRepository.existsByBusinessIdAndNameIgnoreCase(businessId, name)) {
            throw new DuplicateResourceException("Location", "name", name);
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business", "id", businessId));

        boolean isFirst = locationRepository.countByBusinessIdAndActiveTrue(businessId) == 0;
        boolean makePrimary = Boolean.TRUE.equals(request.getPrimary()) || isFirst;

        Location location = Location.builder()
                .business(business)
                .name(name)
                .code(request.getCode() != null ? request.getCode().trim().toUpperCase() : null)
                .address(request.getAddress())
                .phone(request.getPhone())
                .primary(makePrimary)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Location saved = locationRepository.save(location);

        if (makePrimary) {
            locationRepository.clearOtherPrimaryLocations(businessId, saved.getId());
        }

        log.info("Location '{}' (ID: {}) created for business {}", saved.getName(), saved.getId(), businessId);
        return LocationResponse.fromEntity(saved);
    }

    @Transactional
    public LocationResponse updateLocation(Long id, LocationRequest request) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Location location = locationRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", id));

        String name = request.getName().trim();
        if (locationRepository.existsByBusinessIdAndNameIgnoreCaseAndIdNot(businessId, name, id)) {
            throw new DuplicateResourceException("Location", "name", name);
        }

        location.setName(name);
        location.setCode(request.getCode() != null ? request.getCode().trim().toUpperCase() : null);
        location.setAddress(request.getAddress());
        location.setPhone(request.getPhone());
        if (request.getActive() != null) {
            location.setActive(request.getActive());
        }

        if (Boolean.TRUE.equals(request.getPrimary())) {
            location.setPrimary(true);
            locationRepository.clearOtherPrimaryLocations(businessId, id);
        }

        Location updated = locationRepository.save(location);
        log.info("Location {} updated for business {}", id, businessId);
        return LocationResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteLocation(Long id) {
        Long businessId = SecurityUtils.getCurrentBusinessId();
        Location location = locationRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", id));

        if (location.isPrimary()) {
            throw new BadRequestException("Cannot delete primary location. Please assign another location as primary first.");
        }

        locationRepository.delete(location);
        log.info("Location {} deleted for business {}", id, businessId);
    }
}
