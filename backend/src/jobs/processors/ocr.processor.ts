import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Processes OCR jobs for uploaded documents.
 * Uses Tesseract.js for image OCR and pdf-parse for PDF text extraction.
 * The extracted text is stored in the document record for full-text search.
 */
@Processor('ocr')
export class OcrProcessor {
  private readonly logger = new Logger(OcrProcessor.name);
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

  @Process('process-document')
  async handleOcr(job: Job<{ documentId: string; s3Key: string; mimeType: string }>) {
    const { documentId, s3Key, mimeType } = job.data;
    this.logger.log(`Processing OCR job for document: ${documentId}`);

    try {
      // Download file from S3
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: s3Key });
      const response = await this.s3Client.send(command);
      const bodyStream = response.Body;

      if (!bodyStream) {
        throw new Error('Empty file body from S3');
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of bodyStream as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      const fileBuffer = Buffer.concat(chunks);

      await job.progress(30);

      let extractedText = '';

      if (mimeType === 'application/pdf') {
        // PDF text extraction
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(fileBuffer);
        extractedText = pdfData.text;
      } else if (mimeType.startsWith('image/')) {
        // OCR for images using Tesseract.js
        const Tesseract = require('tesseract.js');
        const result = await Tesseract.recognize(fileBuffer, 'eng', {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              job.progress(30 + Math.round(m.progress * 60));
            }
          },
        });
        extractedText = result.data.text;
      }

      await job.progress(90);

      // Store extracted text in the document record
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          ocrContent: extractedText,
          ocrProcessed: true,
        },
      });

      await job.progress(100);
      this.logger.log(`OCR completed for document ${documentId}: ${extractedText.length} characters extracted`);

      return {
        success: true,
        documentId,
        textLength: extractedText.length,
      };
    } catch (error) {
      this.logger.error(`OCR processing failed for document ${documentId}: ${(error as Error).message}`);

      // Mark the document as OCR processed (with no content to indicate failure)
      await this.prisma.document.update({
        where: { id: documentId },
        data: { ocrProcessed: true },
      });

      throw error;
    }
  }
}
