import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { AdminGuard } from 'src/staff/guards/admin.guard';
import { AdminCatalogService } from './admin-catalog.service';
import {
  CreateBreedAdminDto,
  CreateOfferBreedPricingAdminDto,
  CreateOfferCoatPricingAdminDto,
  CreateOfferSizePricingAdminDto,
  CreateOfferVipPricingAdminDto,
  UpdateBreedAdminDto,
  UpdateOfferBreedPricingAdminDto,
  UpdateOfferCoatPricingAdminDto,
  UpdateOfferSizePricingAdminDto,
  UpdateOfferVipPricingAdminDto,
} from './dtos/admin-catalog.dto';

@Controller('admin')
@UseGuards(AccessTokenGuard, AdminGuard)
export class AdminCatalogController {
  constructor(private readonly adminCatalogService: AdminCatalogService) {}

  @Get('breeds')
  findAllBreeds() {
    return this.adminCatalogService.findAllBreeds();
  }

  @Get('breeds/:id')
  findOneBreed(@Param('id', ParseIntPipe) id: number) {
    return this.adminCatalogService.findOneBreed(id);
  }

  @Post('breeds')
  createBreed(@Body() dto: CreateBreedAdminDto) {
    return this.adminCatalogService.createBreed(dto);
  }

  @Patch('breeds/:id')
  updateBreed(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBreedAdminDto,
  ) {
    return this.adminCatalogService.updateBreed(id, dto);
  }

  @Delete('breeds/:id')
  removeBreed(@Param('id', ParseIntPipe) id: number) {
    return this.adminCatalogService.removeBreed(id);
  }

  @Get('offer-breed-pricing')
  findAllOfferBreedPricing() {
    return this.adminCatalogService.findAllOfferBreedPricing();
  }

  @Get('offer-breed-pricing/:id')
  findOneOfferBreedPricing(@Param('id', ParseIntPipe) id: number) {
    return this.adminCatalogService.findOneOfferBreedPricing(id);
  }

  @Post('offer-breed-pricing')
  createOfferBreedPricing(@Body() dto: CreateOfferBreedPricingAdminDto) {
    return this.adminCatalogService.createOfferBreedPricing(dto);
  }

  @Patch('offer-breed-pricing/:id')
  updateOfferBreedPricing(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOfferBreedPricingAdminDto,
  ) {
    return this.adminCatalogService.updateOfferBreedPricing(id, dto);
  }

  @Delete('offer-breed-pricing/:id')
  removeOfferBreedPricing(@Param('id', ParseIntPipe) id: number) {
    return this.adminCatalogService.removeOfferBreedPricing(id);
  }

  @Get('offer-coat-pricing')
  findAllOfferCoatPricing() {
    return this.adminCatalogService.findAllOfferCoatPricing();
  }

  @Get('offer-coat-pricing/:id')
  findOneOfferCoatPricing(@Param('id', ParseIntPipe) id: number) {
    return this.adminCatalogService.findOneOfferCoatPricing(id);
  }

  @Post('offer-coat-pricing')
  createOfferCoatPricing(@Body() dto: CreateOfferCoatPricingAdminDto) {
    return this.adminCatalogService.createOfferCoatPricing(dto);
  }

  @Patch('offer-coat-pricing/:id')
  updateOfferCoatPricing(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOfferCoatPricingAdminDto,
  ) {
    return this.adminCatalogService.updateOfferCoatPricing(id, dto);
  }

  @Delete('offer-coat-pricing/:id')
  removeOfferCoatPricing(@Param('id', ParseIntPipe) id: number) {
    return this.adminCatalogService.removeOfferCoatPricing(id);
  }

  @Get('offer-size-pricing')
  findAllOfferSizePricing() {
    return this.adminCatalogService.findAllOfferSizePricing();
  }

  @Get('offer-size-pricing/:id')
  findOneOfferSizePricing(@Param('id', ParseIntPipe) id: number) {
    return this.adminCatalogService.findOneOfferSizePricing(id);
  }

  @Post('offer-size-pricing')
  createOfferSizePricing(@Body() dto: CreateOfferSizePricingAdminDto) {
    return this.adminCatalogService.createOfferSizePricing(dto);
  }

  @Patch('offer-size-pricing/:id')
  updateOfferSizePricing(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOfferSizePricingAdminDto,
  ) {
    return this.adminCatalogService.updateOfferSizePricing(id, dto);
  }

  @Delete('offer-size-pricing/:id')
  removeOfferSizePricing(@Param('id', ParseIntPipe) id: number) {
    return this.adminCatalogService.removeOfferSizePricing(id);
  }

  @Get('offer-vip-pricing')
  findAllOfferVipPricing() {
    return this.adminCatalogService.findAllOfferVipPricing();
  }

  @Get('offer-vip-pricing/:id')
  findOneOfferVipPricing(@Param('id', ParseIntPipe) id: number) {
    return this.adminCatalogService.findOneOfferVipPricing(id);
  }

  @Post('offer-vip-pricing')
  createOfferVipPricing(@Body() dto: CreateOfferVipPricingAdminDto) {
    return this.adminCatalogService.createOfferVipPricing(dto);
  }

  @Patch('offer-vip-pricing/:id')
  updateOfferVipPricing(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOfferVipPricingAdminDto,
  ) {
    return this.adminCatalogService.updateOfferVipPricing(id, dto);
  }

  @Delete('offer-vip-pricing/:id')
  removeOfferVipPricing(@Param('id', ParseIntPipe) id: number) {
    return this.adminCatalogService.removeOfferVipPricing(id);
  }
}
