import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Vertical } from '../interfaces';
import { VALIDATION } from './constants';

const onlyLettersRegExp: RegExp = /^[A-Za-z]+$/;

export class CreateCatalogDto {
  @IsNotEmpty()
  @IsString()
  @Matches(onlyLettersRegExp, {
    message: VALIDATION.NAME.ONLY_LETTERS,
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Vertical)
  vertical: string;

  @IsOptional()
  @IsBoolean()
  primary?: boolean;
}
