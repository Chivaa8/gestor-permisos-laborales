export class EmployeeModel {
    empId: number;
    empName: string;
    contactNo: string;
    email: string;
    deptName: string;
    designation: string;
    createdDate: Date;
    userName: string;
    password: string;
    sickLeaveBalance: number;
    paidLeaveBalance: number;
    role: string;

    constructor(
        empId: number = 0,
        empName: string = '',
        contactNo: string = '',
        email: string = '',
        deptName: string = '',
        designation: string = '',
        createdDate: Date = new Date(),
        userName: string = '',
        password: string = '',
        sickLeaveBalance: number = 0,
        paidLeaveBalance: number = 0,
        role: string = ''
    ){
        this.empId = empId;
        this.empName = empName;
        this.contactNo = contactNo;
        this.email = email;
        this.deptName = deptName;
        this.designation = designation;
        this.createdDate = createdDate;
        this.userName = userName;
        this.password = password;
        this.sickLeaveBalance = sickLeaveBalance;
        this.paidLeaveBalance = paidLeaveBalance;
        this.role = role;
    }
}

export interface ApiResponseModel {
    message: string,
    data: any
}

export interface LoginModel {
    userName: string;
    password: string;
}