import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConceptsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.concept.findMany({
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });
  }

  async findById(id: string) {
    return this.prisma.concept.findUnique({ where: { id } });
  }

  async findByLevel(level: number) {
    return this.prisma.concept.findMany({
      where: { level },
      orderBy: { name: 'asc' },
    });
  }

  async getConceptTree() {
    const concepts = await this.findAll();
    return concepts.map((c) => ({
      ...c,
      prerequisiteIds: c.prerequisiteIds as string[],
    }));
  }
}
