import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsEnum,
} from 'class-validator';

export class CreateBoardDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsString()
  backgroundColor: string;
}

export class UpdateBoardDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsString()
  backgroundColor: string;
}

export enum UserRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole = UserRole.VIEWER;
}

export class RemoveUserDto {
  @IsString()
  userId: string;
}
