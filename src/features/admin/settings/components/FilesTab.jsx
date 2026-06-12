import { AdminEmptyState } from '../../AdminShared'

function FilesTab({
  fileIdInput,
  fileToUpload,
  onDeleteAdminFile,
  onDownloadAdminFile,
  onSetFileIdInput,
  onSetFileToUpload,
  onUploadAdminFile,
  submitting,
  uploadedFiles,
}) {
  return (
    <div className="admin-grid two-columns">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Upload file</h3>
        </div>
        <form className="admin-form compact" onSubmit={onUploadAdminFile}>
          <label>
            <span>File</span>
            <input onChange={(event) => onSetFileToUpload(event.target.files?.[0] || null)} type="file" />
          </label>
          <button type="submit" disabled={submitting || !fileToUpload}>Upload</button>
        </form>
        <div className="admin-mini-list">
          {uploadedFiles.map((file) => (
            <article key={file.id}>
              <strong>{file.fileName}</strong>
              <span>#{file.id} · {file.contentType || 'file'} · {file.sizeBytes} bytes</span>
              <div className="admin-action-row">
                <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={() => onDownloadAdminFile('preview', file.id)}>Preview</button>
                <button type="button" className="admin-icon-button slim" disabled={submitting} onClick={() => onDownloadAdminFile('download', file.id)}>Download</button>
                <button type="button" className="admin-danger-button slim" disabled={submitting} onClick={() => onDeleteAdminFile(file.id)}>Delete</button>
              </div>
            </article>
          ))}
          {uploadedFiles.length === 0 && <AdminEmptyState message="Chưa upload file trong phiên này." />}
        </div>
      </div>
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>File by ID</h3>
        </div>
        <div className="admin-form compact">
          <label>
            <span>File ID</span>
            <input value={fileIdInput} onChange={(event) => onSetFileIdInput(event.target.value.replace(/\D/g, ''))} inputMode="numeric" />
          </label>
          <div className="admin-action-row">
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onDownloadAdminFile('preview')}>Preview</button>
            <button type="button" className="admin-icon-button" disabled={submitting} onClick={() => onDownloadAdminFile('download')}>Download</button>
            <button type="button" className="admin-danger-button" disabled={submitting} onClick={() => onDeleteAdminFile()}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilesTab
