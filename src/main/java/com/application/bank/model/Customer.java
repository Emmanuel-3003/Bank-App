package com.application.bank.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

@Entity(name = "Customer")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String customerCode;

    @NotBlank(message = "First Name is required..")
    @Size(min = 3)
    private String firstName;

    @Size(min = 3)
    @NotBlank(message = "Last Name is required..")
    private String lastName;

    @Email(message = "Please provide email")
    private String email;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private LocalDate dateOfJoining;

    @NotBlank(message = "Address is required")
    @Size(max = 200, message = "Address cannot exceed 200 characters")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank
    private String country;

    @NotBlank(message = "Pin-code is required")
    @Pattern(
            regexp = "^[1-9][0-9]{5}$",
            message = "Pin-code must be a valid 6-digit number"
    )
    private String pinCode;

    @OneToMany(mappedBy = "customer")
    private List<Account> accounts;
}
