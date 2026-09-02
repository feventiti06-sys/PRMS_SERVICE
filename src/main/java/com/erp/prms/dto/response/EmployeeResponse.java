package com.erp.prms.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class EmployeeResponse {
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String departmentCode;
    private String jobTitle;
    private boolean active;

    public String getFullName() {
        if (firstName != null && lastName != null) return firstName + " " + lastName;
        if (firstName != null) return firstName;
        return employeeId;
    }
}
