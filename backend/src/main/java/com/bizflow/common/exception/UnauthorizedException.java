package com.bizflow.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends BizFlowException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
