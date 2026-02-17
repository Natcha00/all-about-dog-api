import { Controller } from '@nestjs/common';
import { OfferingService } from './offering.service';

@Controller('offering')
export class OfferingController {
  constructor(private readonly offeringService: OfferingService) {}
}
