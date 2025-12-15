// src/app/app.routes.ts
import { Route } from '@angular/router';
import { TemplateListComponent } from './features/templates/pages/template-list/template-list.component';
import { TemplateEditorComponent } from './features/editor/pages/template-editor/template-editor.component';

export const routes: Route[] = [
  { path: '', redirectTo: 'templates', pathMatch: 'full' },
  { path: 'templates', component: TemplateListComponent },
{ path: 'templates/edit/:id', component: TemplateEditorComponent }
];
