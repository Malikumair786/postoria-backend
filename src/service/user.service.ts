import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { User, UserDocument } from 'src/model/user.entity';
  import { Model } from 'mongoose';
  import { CreateUserDto } from 'src/dto/user/create-user.dt';
  import * as bcrypt from 'bcrypt';
  import * as random from 'random-string-alphanumeric-generator';
  
  @Injectable()
  export class UserService {
    private readonly logger = new Logger(UserService.name);
  
    constructor(
      @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}
  
    async findByUsername(username: string): Promise<User> {
      return this.userModel.findOne({ username }).exec();
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
      try {
        this.logger.log(`Creating user with username: ${createUserDto.username}`);
        const hashedPassword = createUserDto.password
          ? await bcrypt.hash(createUserDto.password, 10)
          : null;
        const apiKey = random.randomAlphanumeric(32, 'uppercase');
        const newUser = new this.userModel({
          username: createUserDto.username,
          password: hashedPassword,
          bio: createUserDto.bio,
          profilePicture: createUserDto.profilePicture,
          apiKey,
        });
        const savedUser = await newUser.save();
        this.logger.log(`User created successfully with id: ${savedUser._id}`);
        return savedUser;
      } catch (error) {
        this.logger.error(`Exception creating new user: ${error}`);
        throw new InternalServerErrorException();
      }
    }

    async findUserById(userId: string): Promise<User> {
      try {
        const user = await this.userModel.findById(userId).lean();
        if (!user) {
          this.logger.warn(`User with ID ${userId} not found`);
          throw new NotFoundException('User not found');
        }
        return user;
      } catch (err) {
        this.logger.error(`Error retrieving user with ID ${userId}`, err.stack);
        throw err;
      }
    }
  }
  