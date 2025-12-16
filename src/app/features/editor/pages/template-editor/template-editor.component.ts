import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';
import { MaterialModule } from '../../../../shared/material.module';
import { TemplateService } from '../../../templates/services/template.service';
import { Template } from '../../../../core/models/template.model';
import { RichTextEditorComponent } from '../../../../shared/components/rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-template-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RichTextEditorComponent
  ],
  templateUrl: './template-editor.component.html',
  styleUrls: ['./template-editor.component.scss']
})
export class TemplateEditorComponent implements OnInit {

  templateForm!: FormGroup;
  template!: Template;

  loading = true;
  previewMode = false;
  uploadedFile: { name: string; url: string } | null = null;

  private isInitializing = true;

  @ViewChild('previewSection') previewSection!: ElementRef;

  availableTags = ['Urgent', 'Important', 'Optional'];
  previewVariables = new Map<string, string>();

  constructor(
    private fb: FormBuilder,
    private templateService: TemplateService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.templateService.getTemplateById(id).subscribe(template => {
      this.template = template;
      this.buildForm();
      this.startAutoSave(id);
      this.loading = false;
      this.isInitializing = false;
    });
  }

  buildForm() {
    this.templateForm = this.fb.group({
      name: [this.template.name, Validators.required],
      content: [this.template.content || '', Validators.required],
      clientName: [this.template.clientName, Validators.required],
      contractDate: [
        this.template.contractDate,
        [Validators.required, this.futureDateValidator]
      ],
      contractType: [this.template.contractType, Validators.required],
      attachments: [this.template.attachments || null, Validators.required],
      tags: [this.template.tags || [], Validators.required],
      isActive: [this.template.isActive || false]
    });

    if (this.template.attachments) {
      this.uploadedFile = this.template.attachments;
    }
  }

  startAutoSave(id: number) {
    this.templateForm.valueChanges
      .pipe(debounceTime(800))
      .subscribe(value => {
        if (this.isInitializing || this.templateForm.invalid) return;

        this.templateService.updateTemplate(id, value).subscribe();
      });
  }

  futureDateValidator(control: FormControl) {
    if (!control.value) return null;

    const selected = new Date(control.value);
    const today = new Date();
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selected < today ? { pastDate: true } : null;
  }

  uploadFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    setTimeout(() => {
      const uploaded = {
        name: file.name,
        url: `https://example.com/uploads/${file.name}`
      };

      this.uploadedFile = uploaded;
      this.templateForm.get('attachments')?.setValue(uploaded);
      this.templateForm.get('attachments')?.markAsTouched();
    }, 1000);
  }

  save() {
    const isContentValid = this.validateContent();

    if (this.templateForm.invalid || !isContentValid) {
      this.templateForm.markAllAsTouched();
      return;
    }
    if (this.templateForm.invalid) {
      this.templateForm.markAllAsTouched();
      return;
    }

    this.templateService
      .updateTemplate(this.template.id, this.templateForm.value)
      .subscribe(() => this.router.navigate(['/templates']));
  }

  togglePreview() {
    this.previewMode = !this.previewMode;
    if (this.previewMode) {
      setTimeout(() => {
        this.previewSection?.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
    }
  }

  goBack() {
    this.router.navigate(['/templates']);
  }

  validateContent(): boolean {
    const contentHtml = this.templateForm.get('content')?.value || '';

    // Strip HTML tags and trim
    const bodyText = contentHtml.replace(/<[^>]*>/g, '').trim();

    // If empty, mark as touched and return false
    if (!bodyText) {
      this.templateForm.get('content')?.setErrors({ required: true });
      this.templateForm.get('content')?.markAsTouched();
      return false;
    }

    // Otherwise, clear any previous errors
    this.templateForm.get('content')?.setErrors(null);
    return true;
  }


  onQuillChange(event: any): void {
    const html = event.html;
    const value = html === '<p><br></p>' ? '' : html;
    this.templateForm.get('content')?.setValue(value, { emitEvent: true });
  }

  getPreviewVariables(): string[] {
  const content = this.templateForm.get('content')?.value || '';
  const regex = /\{\{\s*([^}]+)\s*\}\}/g; // supports spaces
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (!matches.includes(match[1])) {
      matches.push(match[1]);
    }
  }

  return matches;
}

  onVariableChange(variable: string, value: string): void {
    this.previewVariables.set(variable, value);
  }

  get renderedPreviewContent(): string {
  let content = this.templateForm.get('content')?.value || '';

  const autoValues: Record<string, string> = {
    'Client Name': this.templateForm.get('clientName')?.value || '',
    'Contract Date': this.templateForm.get('contractDate')?.value
      ? new Date(this.templateForm.get('contractDate')?.value).toDateString()
      : ''
  };

  Object.keys(autoValues).forEach(key => {
    content = content.replace(
      new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
      autoValues[key]
    );
  });

  return content;
}


}
