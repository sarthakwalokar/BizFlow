package com.bizflow.common.exception;

public class BizFlowException extends RuntimeException {

    public BizFlowException(String message) {
        super(message);
    }

    public BizFlowException(String message, Throwable cause) {
        super(message, cause);
    }
}
