import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNumber()
  id!: number; // PrimaryColumn — not auto-generated

  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price!: number;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  specifications?: string; // entity stores this as string
}