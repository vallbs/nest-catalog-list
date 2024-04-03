import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Vertical } from '../interfaces';

const onlyLettersRegExp: RegExp = /^[A-Za-z]+$/;

export class CreateCatalogDto {
  @IsNotEmpty()
  @IsString()
  @Matches(onlyLettersRegExp, {
    message: 'name can contain only letters',
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
