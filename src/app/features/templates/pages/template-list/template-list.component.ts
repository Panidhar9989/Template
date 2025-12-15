import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateService } from '../../services/template.service';
import { Template } from '../../../../core/models/template.model';
import { MaterialModule } from '../../../../shared/material.module';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RenameDialogComponent } from '../../components/rename-dialog/rename-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss']
})
export class TemplateListComponent implements OnInit {
  templates: Template[] = [];
  selectedTemplate: Template | null = null;

  dynamicFields = [
    { key: 'clientName', label: 'Client Name' },
    { key: 'contractDate', label: 'Contract Date' },
    { key: 'contractType', label: 'Contract Type' },
    { key: 'attachments', label: 'Attachments' },
    { key: 'tags', label: 'Tags', isArray: true }, 
    { key: 'isActive', label: 'Status', isBoolean: true }
  ];

  constructor(private templateService: TemplateService, private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.templateService.getTemplates().subscribe({
      next: (data) => this.templates = data,
      error: (err) => console.error('Error loading templates:', err)
    });
  }

  create() {
    const name = prompt('Enter template name:');
    if (!name) return;

    this.templateService.createTemplate(name).subscribe(() => this.load());
  }

  delete(id: number) {
    if (!confirm('Are you sure you want to delete?')) return;

    this.templateService.deleteTemplate(id).subscribe(() => this.load());
  }

  rename(template: Template) {
    const dialogRef = this.dialog.open(RenameDialogComponent, {
      data: { name: template.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.templateService.updateTemplate(template.id, { name: result }).subscribe(() => this.load());
      }
    });
  }

  view(id: number) {
    this.templateService.getTemplateById(id).subscribe({
      next: (template) => {
        this.selectedTemplate = template;
      },
      error: (err) => console.error('Error fetching template:', err)
    });
  }

  edit(id: number) {
    this.router.navigate(['/templates/edit', id]);
  }
}
