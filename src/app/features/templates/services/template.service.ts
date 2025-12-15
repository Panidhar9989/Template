import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Template } from '../../../core/models/template.model';
import { AppConstants } from '../../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private baseUrl = `${AppConstants.apiUrl}/templates`;

  constructor(private http: HttpClient) {}

  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(this.baseUrl);
  }

  createTemplate(name: string): Observable<Template> {
    return this.http.post<Template>(this.baseUrl, { name });
  }

  updateTemplate(id: number, data: Partial<Template>): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteTemplate(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getTemplateById(id: number): Observable<Template> {
    return this.http.get<Template>(`${this.baseUrl}/${id}`);
  }
}
