import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    email: string;
    passwordHash?: string | null;
    name?: string;
    emailVerified?: boolean;
    authProvider?: string | null;
    authProviderId?: string | null;
    avatarUrl?: string | null;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash ?? null,
        name: data.name ?? null,
        emailVerified: data.emailVerified ?? false,
        authProvider: data.authProvider ?? null,
        authProviderId: data.authProviderId ?? null,
        avatarUrl: data.avatarUrl ?? null,
      },
    });
  }

  async setEmailVerified(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findDeletedByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: { not: null } },
    });
  }

  async findByProvider(provider: string, providerId: string) {
    return this.prisma.user.findFirst({
      where: {
        authProvider: provider,
        authProviderId: providerId,
        deletedAt: null,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /** Soft delete: deletedAt 설정, 관련 데이터는 1년 보관 후 정리 예정 */
  async deleteUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }

  async updateProfile(userId: string, data: { name?: string; preferredLanguage?: string | null }) {
    const updateData: { name?: string | null; preferredLanguage?: string | null } = {};
    if (data.name !== undefined) updateData.name = data.name || null;
    if (data.preferredLanguage !== undefined) updateData.preferredLanguage = data.preferredLanguage;
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async updateProviderInfo(
    userId: string,
    data: {
      authProvider: string;
      authProviderId: string;
      avatarUrl?: string | null;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        authProvider: data.authProvider,
        authProviderId: data.authProviderId,
        avatarUrl: data.avatarUrl ?? undefined,
      },
    });
  }
}
