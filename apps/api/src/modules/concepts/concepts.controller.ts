import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConceptsService } from './concepts.service';

@Controller('concepts')
@UseGuards(JwtAuthGuard)
export class ConceptsController {
  constructor(private readonly conceptsService: ConceptsService) {}

  @Get()
  findAll(@Query('level') level?: string) {
    if (level) {
      return this.conceptsService.findByLevel(parseInt(level, 10));
    }
    return this.conceptsService.findAll();
  }

  @Get('tree')
  getConceptTree() {
    return this.conceptsService.getConceptTree();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conceptsService.findById(id);
  }
}
