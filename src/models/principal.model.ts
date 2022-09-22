export interface IPrincipal {
  username: string;
  displayName: string;
  loginTime: Date;
  roles: string[];
}
