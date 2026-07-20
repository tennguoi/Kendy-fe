import { memo, useRef, useState, useEffect, useCallback } from 'react'
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

function focusEditor(editor) {
  requestAnimationFrame(() => {
    editor.editing.view.focus()
  })
}

function RichEditor({ value, onChange, placeholder, minHeight = 200 }) {
  const editorRef = useRef(null)
  const timerRef = useRef(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) {
      return
    }
    if (value === undefined || value === null) return

    if (editor.editing.view.document.isFocused) {
      return
    }

    const current = editor.getData()
    if (current !== value) {
      editor.setData(value)
    }
  }, [value])

  const debouncedOnChange = useCallback((data) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(data)
    }, 300)
  }, [onChange])

  const handleChange = useCallback((_event, editor) => {
    debouncedOnChange(editor.getData())
  }, [debouncedOnChange])

  if (!hydrated) return null

  return (
    <div className="rich-editor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        config={{
          ...defaultConfig,
          placeholder: placeholder || '',
        }}
        onReady={(editor) => {
          editorRef.current = editor
          if (value) editor.setData(value)
          const style = document.createElement('style')
          style.textContent = `
            .ck-editor__editable_inline {
              min-height: ${minHeight}px;
              max-height: 600px;
            }
          `
          editor.ui.view.editable.element.parentElement.appendChild(style)
          focusEditor(editor)
        }}
        onChange={handleChange}
      />
    </div>
  )
}

export default memo(RichEditor)
