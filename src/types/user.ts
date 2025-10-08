export enum IUserRole {
    ADMIN = "ADMIN",
    USER = "USER",
}

export interface IUser{
    _id?: string;
    firstName?: string;
    secondName?: string;
    email: string;
    password?: string;
    role: IUserRole;
    avatar?: string;
    isValidate: boolean;
    isRegComplet?: boolean;
}