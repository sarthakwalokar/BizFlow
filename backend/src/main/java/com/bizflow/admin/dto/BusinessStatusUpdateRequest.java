package com.bizflow.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessStatusUpdateRequest {

    @NotNull(message = "Active status must be specified")
    private Boolean active;
}
