import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    email: string;
    passwordHash: string;
    name?: string;
    emailVerified?: boolean;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name ?? null,
        emailVerified: data.emailVerified ?? false,
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
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
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
}
