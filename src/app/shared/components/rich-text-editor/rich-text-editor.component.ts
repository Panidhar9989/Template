import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Toolbar -->
    <div class="toolbar">
      <button type="button" (click)="format('bold')"><b>B</b></button>
      <button type="button" (click)="format('italic')"><i>I</i></button>
      <button type="button" (click)="format('underline')"><u>U</u></button>

      <!-- ✅ Font color -->
      <input
        type="color"
        title="Text color"
        (input)="setColor($event)"
      />
    </div>

    <div class="editor-root" #root>
      <div
        #editor
        class="editor-box"
        contenteditable="true"
        (input)="onInput()"
        (keydown)="onKeyDown($event)"
      ></div>

      <!-- Mentions -->
      <div
        class="mention-box"
        *ngIf="showList"
        [style.left.px]="mentionLeft"
        [style.top.px]="mentionTop"
      >
        <div
          class="mention-item"
          *ngFor="let p of filteredPeople; let i = index"
          [class.active]="i === activeIndex"
          (mousedown)="selectMention(p, $event)"
        >
          {{ '@' + p }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }

    .editor-root { position: relative; }

    .editor-box {
      min-height: 120px;
      border: 1px solid #ccc;
      padding: 8px;
      border-radius: 5px;
      background: #fff;
      outline: none;
      white-space: pre-wrap;
    }

    .mention-box {
      position: absolute;
      z-index: 50;
      background: #fff;
      border: 1px solid #ddd;
      width: 190px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.12);
      max-height: 180px;
      overflow: auto;
    }

    .mention-item {
      padding: 6px 8px;
      cursor: pointer;
    }

    .mention-item.active {
      background: #dbefff;
    }
  `]
})
export class RichTextEditorComponent implements AfterViewInit {

  private _content = '';
  private isTyping = false;

  @Input()
  set content(v: string) {
    this._content = v || '';
    if (!this.isTyping && this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this._content;
    }
  }
  get content() { return this._content; }

  @Output() contentChange = new EventEmitter<string>();

  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;
  @ViewChild('root', { static: true }) rootRef!: ElementRef<HTMLDivElement>;

  people = ['Phani', 'Pavan', 'Sai', 'Mani', 'Ravi', 'Kiran', 'Kishore'];
  filteredPeople: string[] = [];
  showList = false;
  mentionLeft = 0;
  mentionTop = 0;
  activeIndex = 0;

  ngAfterViewInit() {
    this.editorRef.nativeElement.innerHTML = this._content;
  }

  format(cmd: string) {
    this.editorRef.nativeElement.focus();
    document.execCommand(cmd);
    this.emitContent();
  }

  
  setColor(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    this.editorRef.nativeElement.focus();
    document.execCommand('foreColor', false, color);
    this.emitContent();
  }

  onInput() {
    this.isTyping = true;
    this.emitContent();
    setTimeout(() => this.isTyping = false);
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.showList) return;

    if (event.key === 'ArrowDown') {
      this.activeIndex = Math.min(this.activeIndex + 1, this.filteredPeople.length - 1);
      event.preventDefault();
    }

    if (event.key === 'ArrowUp') {
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      event.preventDefault();
    }

    if (event.key === 'Enter') {
      this.insertMention(this.filteredPeople[this.activeIndex]);
      event.preventDefault();
    }
  }

  selectMention(name: string, ev: MouseEvent) {
    ev.preventDefault();
    this.insertMention(name);
  }

  private insertMention(name: string) {
    document.execCommand('insertText', false, `${name} `);
    this.closeMention();
    this.emitContent();
  }

  private emitContent() {
    this._content = this.editorRef.nativeElement.innerHTML;
    this.contentChange.emit(this._content);
  }

  private closeMention() {
    this.showList = false;
    this.filteredPeople = [];
    this.activeIndex = 0;
  }

  @HostListener('document:selectionchange')
  onSelectionChange() {
    const sel = document.getSelection();
    if (!sel || !sel.anchorNode) return;

    const text = sel.anchorNode.textContent || '';
    const offset = sel.anchorOffset;
    const at = text.lastIndexOf('@', offset - 1);

    if (at === -1) {
      this.closeMention();
      return;
    }

    const query = text.slice(at + 1, offset);
    if (query.includes(' ')) {
      this.closeMention();
      return;
    }

    this.filteredPeople = this.people.filter(p =>
      p.toLowerCase().startsWith(query.toLowerCase())
    );

    this.showList = this.filteredPeople.length > 0;
  }
}