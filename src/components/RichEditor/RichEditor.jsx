import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

const defaultConfig = {
  toolbar: {
    items: [
      'undo', 'redo',
      '|', 'heading',
      '|', 'bold', 'italic', 'underline', 'strikethrough', 'code',
      '|', 'bulletedList', 'numberedList', 'todoList',
      '|', 'outdent', 'indent',
      '|', 'alignment',
      '|', 'link', 'blockQuote', 'codeBlock', 'horizontalLine',
      '|', 'insertTable', 'mediaEmbed',
      '|', 'specialCharacters',
      '|', 'removeFormat', 'sourceEditing',
    ],
    shouldNotGroupWhenFull: false,
  },
  heading: {
    options: [
      { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
      { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
      { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
    ],
  },
  alignment: {
    options: ['left', 'center', 'right'],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: 'https://',
  },
  removePlugins: ['Title', 'Markdown'],
}

function RichEditor({ value, onChange, placeholder, minHeight = 200 }) {
  return (
    <div className="rich-editor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        data={value || ''}
        config={{
          ...defaultConfig,
          placeholder: placeholder || '',
        }}
        onChange={(event, editor) => {
          const data = editor.getData()
          onChange(data)
        }}
        onReady={(editor) => {
          const style = document.createElement('style')
          style.textContent = `
            .ck-editor__editable_inline {
              min-height: ${minHeight}px;
              max-height: 600px;
            }
          `
          editor.ui.view.editable.element.parentElement.appendChild(style)
        }}
      />
    </div>
  )
}

export default RichEditor
