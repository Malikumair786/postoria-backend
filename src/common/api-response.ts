export class ApiResponse {
  success: boolean;
  status: string;
  message: string;
  data: any | null;

  constructor(
    success: boolean,
    status: string,
    message: string,
    data: any = null,
  ) {
    this.success = success;
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
