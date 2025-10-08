export interface IOtp{
    _id?: string,
    email: string,
    otp: string,
    expiresAt: Date,
}