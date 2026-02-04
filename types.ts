
export enum ArchitectureType {
  CHROME_EXTENSION = 'CHROME_EXTENSION',
  MULTIMODAL_VISION = 'MULTIMODAL_VISION',
  ACCESSIBILITY_BRIDGE = 'ACCESSIBILITY_BRIDGE'
}

export interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isVisionPart?: boolean;
}

export interface GeometryShape {
  type: 'triangle' | 'circle' | 'rectangle';
  label?: string;
  dimensions?: string[];
  color?: string;
}

export interface Problem {
  id: string;
  subject: 'Math' | 'Reading';
  question: string;
  context: string;
  shapes?: GeometryShape[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ArchitectureInfo {
  id: ArchitectureType;
  title: string;
  description: string;
  benefits: string[];
  techStack: string[];
  chromebookNote: string;
}
