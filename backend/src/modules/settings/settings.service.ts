import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/create-setting.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSettingDto, user: AuthenticatedUser) {
    const existing = await this.prisma.systemSetting.findUnique({ where: { key: dto.key } });
    if (existing) throw new ConflictException(`Setting "${dto.key}" already exists`);

    return this.prisma.systemSetting.create({
      data: {
        key: dto.key,
        value: dto.value,
        description: dto.description,
        updatedById: user.sub,
      },
    });
  }

  async findAll(category?: string) {
    const where: any = {};
    if (category) {
      where.key = { startsWith: category };
    }

    const settings = await this.prisma.systemSetting.findMany({
      where,
      orderBy: { key: 'asc' },
    });

    return settings.map((s) => ({
      ...s,
      value: s.value,
    }));
  }

  async findByKey(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    return { ...setting, value: setting.value };
  }

  async update(key: string, dto: UpdateSettingDto, user: AuthenticatedUser) {
    await this.findByKey(key);
    return this.prisma.systemSetting.update({
      where: { key },
      data: {
        value: dto.value,
        updatedById: user.sub,
      },
    });
  }

  async delete(key: string) {
    await this.findByKey(key);
    return this.prisma.systemSetting.delete({ where: { key } });
  }

  async getValue<T>(key: string, defaultValue?: T): Promise<T> {
    try {
      const setting = await this.findByKey(key);
      return setting.value as T;
    } catch {
      if (defaultValue !== undefined) return defaultValue;
      throw new NotFoundException(`Setting "${key}" not found`);
    }
  }
}
