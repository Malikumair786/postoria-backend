import {
  Body,
  Controller,
  Post,
  Logger,
  Res,
  HttpStatus,
  Inject,
  forwardRef,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from 'src/dto/user/create-user.dt';
import { UserService } from 'src/service/user.service';
import { ApiResponse } from 'src/common/api-response';
import { ResponseCodes } from 'src/common/response-codes.enum';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private logger = new Logger(UserController.name);

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      this.logger.log(`Creating new user with username ${createUserDto.username}`);
      const existingUser = await this.userService.findByUsername(createUserDto.username);
      if (existingUser) {
        this.logger.log(`User already exists ${createUserDto.username}`);
        return res.status(HttpStatus.FORBIDDEN).json(new ApiResponse(true,ResponseCodes.USER_ALREADY_EXISTS,'User already exists'));
      }
      if (createUserDto.password !== createUserDto.confirmPassword) {
        this.logger.error(`Password and Confirm Password do not match`);
        return res.status(HttpStatus.BAD_REQUEST).json(new ApiResponse(false,ResponseCodes.GENERIC_BAD_REQUEST,'Password and Confirm Password do not match'));
      }
      const newUser = await this.userService.createUser(createUserDto);
      this.logger.log(`Signup successful for user: ${createUserDto.username}`);
      return res.status(HttpStatus.CREATED).json(new ApiResponse(true,ResponseCodes.USER_CREATED,'User created successfully',{ username: newUser.username }));
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ApiResponse(false,ResponseCodes.GENERIC_INTERNAL_SERVER_ERROR,'Internal Server Error'));
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user.userId;
    this.logger.log(`Fetching current user data for userId: ${userId}`);

    try {
      const user = await this.userService.findUserById(userId);
      return {
        userId: req.user.userId,
        username: user.username,
        imageUrl: user.profilePicture,
      };
    } catch (err) {
      this.logger.error(`Failed to fetch user data for userId: ${userId}`, err.stack);
      throw err;
    }
  }
}
