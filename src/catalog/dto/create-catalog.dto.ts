import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Vertical } from '../interfaces';
import { VALIDATION } from './constants';

const onlyLettersRegExp: RegExp = /^[A-Za-z]+$/;

export class CreateCatalogDto {
  @ApiProperty({
    description: 'The name of the catalog (letters only)',
    example: 'Electronics',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(onlyLettersRegExp, {
    message: VALIDATION.NAME.ONLY_LETTERS,
  })
  name: string;

  @ApiProperty({
    description: 'The vertical category of the catalog',
    enum: Vertical,
    example: 'RETAIL',
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(Vertical)
  vertical: string;

  @ApiProperty({
    description: 'Whether this is a primary catalog',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  primary?: boolean;
}
