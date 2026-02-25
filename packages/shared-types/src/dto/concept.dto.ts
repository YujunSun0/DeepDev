export interface ConceptDto {
  id: string;
  name: string;
  description: string;
  level: number;
  prerequisiteIds: string[];
  masteryWeight: number;
}

export interface ConceptTreeNode extends ConceptDto {
  children: ConceptTreeNode[];
  masteryScore?: number;
  masteryLevel?: string;
}
