package com.application.bank.exceptions;

public class APIException extends RuntimeException {

    public APIException() {

    }

    public APIException(String message) {
        super(message);
    }
}
