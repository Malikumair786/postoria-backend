import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { SignInDto } from 'src/dto/auth/sign-in.dt';
import { AuthService } from 'src/service/auth.service';
import { ApiResponse } from 'src/common/api-response';
import { ResponseCodes } from 'src/common/response-codes.enum';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() signInDto: SignInDto, @Res() res: Response) {
    this.logger.log(`Login attempt for username: ${signInDto.username}`);
    try {
        this.logger.log('Validating user credentials...');
        const user = await this.authService.validateUser(signInDto.username, signInDto.password);
        if (!user) {
            this.logger.warn(`Invalid credentials for username: ${signInDto.username}`);
            return res.status(HttpStatus.UNAUTHORIZED).json(new ApiResponse(false, ResponseCodes.USER_NOT_AUTHORIZED, 'Invalid credentials'),);
        }
        this.logger.log(`User validated. Generating JWT token for user: ${signInDto.username}`);
        const token = await this.authService.login(user);
        this.logger.log(`Login successful for user: ${signInDto.username}`);
        return res.status(HttpStatus.OK).json(new ApiResponse(true, ResponseCodes.USER_SUCCESS, 'Login successful', token));
    } catch (err) {
        this.logger.error(`Login failed for username ${signInDto.username}: ${err.message}`);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ApiResponse(false, ResponseCodes.GENERIC_INTERNAL_SERVER_ERROR, 'Server error'));
    }
  }
}
