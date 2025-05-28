import { LoginModel } from '@/model/login.model';

export class Login implements LoginModel {
  username: string;
  password: string;

  constructor(service: LoginModel) {
    this.username = service.username;
    this.password = service.password;
  }
}
