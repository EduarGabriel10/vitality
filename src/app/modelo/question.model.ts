export interface Question {
    id: number;
    text: string;
    responseType: 'yesno' | 'yesnodetail' | 'text' | 'optionaltext' | 'directOptions';
    section: string;
    detailOptions?: string[];
    answer?: string;
    additionalInfo?: string;
    options?: string[];
  }