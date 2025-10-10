export enum IUserRole {
    ADMIN = "ADMIN",
    USER = "USER",
}

export interface IUser{
    _id?: string;
    firstName?: string;
    lastName?: string;
    phone?: number;
    email: string;
    password?: string;
    role: IUserRole;
    avatar?: string;
    isValidate: boolean;
    isRegComplet?: boolean;
}