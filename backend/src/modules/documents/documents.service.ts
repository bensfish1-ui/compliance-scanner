import {
  Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { PaginationQueryDto, buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
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

  async getUploadUrl(fileName: string, mimeType: string): Promise<{ uploadUrl: string; s3Key: string }> {
    const s3Key = `documents/${uuidv4()}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return { uploadUrl, s3Key };
  }

  async getDownloadUrl(id: string): Promise<{ downloadUrl: string; fileName: string }> {
    const doc = await this.findOne(id);

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: doc.filePath || '',
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return { downloadUrl, fileName: doc.title };
  }

  async create(dto: CreateDocumentDto, user: AuthenticatedUser) {
    const document = await this.prisma.document.create({
      data: {
        title: dto.name,
        description: dto.description,
        type: dto.type as any,
        filePath: dto.s3Key,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize ? BigInt(dto.fileSize) : null,
        ownerId: user.sub,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        tags: dto.tags || [],
      },
    });

    // Trigger OCR processing for PDF and image files
    if (['application/pdf', 'image/png', 'image/jpeg', 'image/tiff'].includes(dto.mimeType)) {
      this.eventEmitter.emit('document.ocr-requested', {
        documentId: document.id,
        s3Key: dto.s3Key,
        mimeType: dto.mimeType,
      });
    }

    return document;
  }

  async findAll(query: PaginationQueryDto) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { createdAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  async update(id: string, dto: Partial<CreateDocumentDto>, _user: AuthenticatedUser) {
    await this.findOne(id);
    return this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.name ? { title: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      },
    });
  }

  async delete(id: string, _user: AuthenticatedUser) {
    const doc = await this.findOne(id);

    // Delete from S3
    if (doc.filePath) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: doc.filePath,
        });
        await this.s3Client.send(command);
      } catch (error) {
        this.logger.error(`Failed to delete S3 object ${doc.filePath}: ${(error as Error).message}`);
      }
    }

    return this.prisma.document.delete({
      where: { id },
    });
  }

  async getExpiringDocuments(withinDays: number = 30) {
    const futureDate = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000);
    return this.prisma.document.findMany({
      where: {
        isArchived: false,
        expiryDate: { lte: futureDate, gte: new Date() },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
