import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Cognito refresh token' })
  @IsString()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Access token (JWT)' })
  accessToken: string;

  @ApiProperty({ description: 'ID token (JWT)' })
  idToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token expiration in seconds' })
  expiresIn: number;
}

export class UserProfileDto {
  @ApiProperty() sub: string;
  @ApiProperty() email: string;
  @ApiProperty() name: string;
  @ApiProperty({ type: [String] }) roles: string[];
  @ApiProperty() organizationId: string;
}
