export interface Template {
  id: number;
  name: string;
  content: string;
  fields: { [key: string]: any };
  clientName?: string;
  contractDate?: string;
  contractType?: string;
  attachments?: { name: string; url: string } | null;
  tags?: string[];       
  isActive?: boolean; 
  [key: string]: any; 
}
