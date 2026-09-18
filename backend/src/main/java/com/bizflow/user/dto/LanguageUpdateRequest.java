package com.bizflow.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LanguageUpdateRequest {

    @NotBlank(message = "Language code is required")
    @Size(min = 2, max = 20, message = "Language code must be between 2 and 20 characters")
    private String language;
}
