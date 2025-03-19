export interface SignupDTO {
  planId: string;
  saveCard: boolean;
  billingType: string;
  cycle: string;
  description: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  userInfo: {
    name: string;
    email: string;
    password: string;
    cpfCnpj: string;
  };
}
