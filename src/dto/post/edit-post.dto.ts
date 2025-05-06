import { IsString, IsArray, IsOptional } from 'class-validator';

export class EditPostDto {
  @IsString()
  @IsOptional() // Allow partial updates
  text: string;

  @IsArray()
  @IsOptional() // Allow partial updates
  imageUrls: string[];
}
