import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

/**
 * Upload files to DigitalOcean Spaces (S3-compatible).
 * Env: DO_STORAGE_KEY, DO_STORAGE_SECRET, DO_STORAGE_BUCKET,
 *      DO_STORAGE_ENDPOINT (API e.g. https://sgp1.digitaloceanspaces.com),
 *      DO_STORAGE_PUBLIC_URL (optional, e.g. https://all-about-dog.sgp1.digitaloceanspaces.com)
 */
@Injectable()
export class DoSpacesService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('DO_STORAGE_ENDPOINT');
    const region = this.configService.get<string>('DO_STORAGE_REGION', 'sgp1');
    this.bucket = this.configService.getOrThrow<string>('DO_STORAGE_BUCKET');
    const apiEndpoint = endpoint ?? `https://${region}.digitaloceanspaces.com`;

    this.publicBaseUrl =
      this.configService.get<string>('DO_STORAGE_PUBLIC_URL') ??
      `https://${this.bucket}.${apiEndpoint.replace(/^https?:\/\//, '')}`;

    this.client = new S3Client({
      endpoint: apiEndpoint,
      region,
      forcePathStyle: false,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('DO_STORAGE_KEY'),
        secretAccessKey: this.configService.getOrThrow<string>('DO_STORAGE_SECRET'),
      },
    });
  }

  /**
   * Upload a file and return the public URL.
   * @param key Object key (e.g. slips/RSV-20260101-0001/1738xxx.jpg)
   * @param body Buffer or Uint8Array
   * @param contentType e.g. image/jpeg
   */
  async upload(
    key: string,
    body: Buffer | Uint8Array,
    contentType: string,
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: 'public-read',
      }),
    );
    const baseUrl = this.publicBaseUrl.replace(/\/$/, '');
    return `${baseUrl}/${key}`;
  }
}
