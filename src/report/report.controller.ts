import {
  Controller,
  Get,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { GetOfferingSummaryUsecase } from './use-cases/get-offering-summary.usecase';
import { GetOfferingSummaryRequest } from './dtos/get-offering-summary.dto';
import { GetOfferingSummaryResponse } from './dtos/get-offering-summary.dto';
import { AccessTokenGuard } from 'src/user/guards/access-token.guard';
import { AdminGuard } from 'src/staff/guards/admin.guard';

const CSV_HEADERS = [
  'code',
  'status',
  'startDateTime',
  'endDateTime',
  'remark',
  'offeringType',
  'slip',
  'slipStatus',
  'slipRejectedReason',
  'slipApprovedBy',
  'slipUpdatedAt',
  'price',
  'quantity',
  'groupNumber',
  'buildingName',
  'isVip',
  'dogName',
  'dogBreed',
  'dogSize',
  'dogCoat',
  'dogOwnerName',
] as const;

function escapeCsvCell(value: unknown): string {
  if (value == null) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows: GetOfferingSummaryResponse[]): string {
  const header = CSV_HEADERS.join(',');
  const body = rows
    .map((row) =>
      CSV_HEADERS.map((key) =>
        escapeCsvCell((row as unknown as Record<string, unknown>)[key]),
      ).join(','),
    )
    .join('\n');
  return '\uFEFF' + header + '\n' + body;
}

@Controller('report')
export class ReportController {
  constructor(
    private readonly getOfferingSummaryUsecase: GetOfferingSummaryUsecase,
  ) {}

  @UseGuards(AccessTokenGuard, AdminGuard)
  @Get('offering/summary')
  async getOfferingSummary(
    @Query() request: GetOfferingSummaryRequest,
  ): Promise<StreamableFile> {
    const rows = await this.getOfferingSummaryUsecase.execute(request);
    const csv = toCsv(rows);
    const buffer = Buffer.from(csv, 'utf-8');
    const startPart = (request.start ?? '').slice(0, 10).replace(/-/g, '');
    const endPart = (request.end ?? '').slice(0, 10).replace(/-/g, '');
    const typePart = request.offeringType ?? 'all';
    const now = new Date();
    const requestedAt =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      'T' +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    const filename = `${typePart}-summary-${startPart}-to-${endPart}-${requestedAt}.csv`;
    return new StreamableFile(buffer, {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
