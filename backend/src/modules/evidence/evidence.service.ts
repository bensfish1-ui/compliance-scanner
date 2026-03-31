import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const s3Endpoint = this.configService.get<string>('aws.s3.endpoint');

    this.s3Client = new S3Client({
      region: this.configService.get<string>('aws.region', 'eu-west-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId', ''),
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey', ''),
      },
      ...(s3Endpoint ? { endpoint: s3Endpoint, forcePathStyle: true } : {}),
    });

    this.bucket = this.configService.get<string>('aws.s3.bucket', 'compliance-scanner-documents');
  }

  async getUploadUrl(fileName: string, mimeType: string) {
    const s3Key = `evidence/${uuidv4()}/${fileName}`;
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: s3Key, ContentType: mimeType });
    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return { uploadUrl, s3Key };
  }

  async getDownloadUrl(id: string) {
    const evidence = await this.findOne(id);
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: evidence.filePath });
    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return { downloadUrl, fileName: evidence.name };
  }

  async create(dto: CreateEvidenceDto, user: AuthenticatedUser) {
    return this.prisma.evidenceFile.create({
      data: {
        name: dto.title,
        description: dto.description,
        type: (dto as any).type || 'DOCUMENT',
        filePath: dto.s3Key,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize ? BigInt(dto.fileSize) : null,
        uploadedById: user.sub,
        regulationId: (dto as any).regulationId || null,
        auditId: dto.auditId || null,
        projectId: (dto as any).projectId || null,
        taskId: (dto as any).taskId || null,
      },
    });
  }

  async findAll(query: PaginationQueryDto & { controlId?: string; obligationId?: string; auditId?: string }) {
    const where: any = {};
    if (query.auditId) where.auditId = query.auditId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.evidenceFile.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { createdAt: 'desc' },
      }),
      this.prisma.evidenceFile.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const evidence = await this.prisma.evidenceFile.findUnique({ where: { id } });
    if (!evidence) throw new NotFoundException(`Evidence ${id} not found`);
    return evidence;
  }

  async delete(id: string, _user: AuthenticatedUser) {
    const evidence = await this.findOne(id);

    try {
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: evidence.filePath }));
    } catch (error) {
      this.logger.error(`Failed to delete S3 object: ${(error as Error).message}`);
    }

    return this.prisma.evidenceFile.delete({ where: { id } });
  }
}
