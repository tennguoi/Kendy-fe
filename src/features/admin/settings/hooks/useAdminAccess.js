import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '../../../../api/admin.api'

export function useAdminAccess({
  loadSettings,
  onSetNotice,
  setSubmitting,
  setViewError,
  token,
}) {
  const { t } = useTranslation()
  const [admins, setAdmins] = useState([])
  const [selectedAdminId, setSelectedAdminId] = useState(null)
  const [adminEditor, setAdminEditor] = useState({
    legacyRole: 'ADMIN',
    permissionCodes: [],
    reason: '',
    roleIds: [],
    verificationCode: '',
  })
  const [adminSessions, setAdminSessions] = useState([])
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState(null)
  const [roleDraft, setRoleDraft] = useState({ description: '', name: '', permissionIds: [] })
  const [totpSetup, setTotpSetup] = useState(null)

  const selectedAdmin = admins.find((admin) => admin.id === selectedAdminId) || admins[0]
  const selectedRole = roles.find((role) => role.id === selectedRoleId)

  useEffect(() => {
    if (!token || !selectedAdmin?.id) {
      return
    }

    let active = true
    async function loadAdminDetail() {
      try {
        const [legacyRoleData, permissionData, roleData, sessionsData] = await Promise.all([
          adminApi.getAdminLegacyRole(selectedAdmin.id, token),
          adminApi.getAdminPermissions(selectedAdmin.id, token),
          adminApi.getUserAdminRoles(selectedAdmin.id, token),
          adminApi.getAdminSessions(selectedAdmin.id, token),
        ])
        if (!active) {
          return
        }
        setAdminEditor((current) => ({
          ...current,
          legacyRole: legacyRoleData.role || selectedAdmin.role || 'ADMIN',
          permissionCodes: permissionData.permissions || [],
          roleIds: (roleData.roles || []).map((role) => role.id),
        }))
        setAdminSessions(sessionsData)
        setTotpSetup(null)
      } catch (err) {
        if (active) {
          setViewError(err.message || t('admin.settings.error.loadAdminDetail'))
        }
      }
    }

    loadAdminDetail()
    return () => {
      active = false
    }
  }, [selectedAdmin?.id, selectedAdmin?.role, setViewError, t, token])

  const togglePermission = (permissionId) => {
    setRoleDraft((current) => ({
      ...current,
      permissionIds: current.permissionIds.includes(permissionId)
        ? current.permissionIds.filter((id) => id !== permissionId)
        : [...current.permissionIds, permissionId],
    }))
  }

  const selectRoleForEdit = (roleId) => {
    const role = roles.find((item) => item.id === roleId)
    setSelectedRoleId(roleId || null)
    setRoleDraft(
      role
        ? {
          description: role.description || '',
          name: role.name || '',
          permissionIds: permissions
            .filter((permission) => role.permissions?.includes(permission.code))
            .map((permission) => permission.id),
        }
        : { description: '', name: '', permissionIds: [] },
    )
  }

  const saveRole = async (event) => {
    event.preventDefault()
    if (!roleDraft.name.trim()) {
      setViewError(t('admin.settings.error.roleNameRequired'))
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = {
        description: roleDraft.description.trim(),
        name: roleDraft.name.trim(),
        permissionIds: roleDraft.permissionIds,
        version: selectedRole?.version,
      }
      const saved = selectedRole
        ? await adminApi.updateRole(selectedRole.id, payload, token)
        : await adminApi.createRole(payload, token)
      setSelectedRoleId(saved.id)
      await loadSettings()
      onSetNotice(t('admin.settings.success.roleSaved', { name: saved.name }))
    } catch (err) {
      setViewError(err, t('admin.settings.error.roleSaveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const deleteRole = async () => {
    if (!selectedRole) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.deleteRole(selectedRole.id, token)
      setSelectedRoleId(null)
      setRoleDraft({ description: '', name: '', permissionIds: [] })
      await loadSettings()
      onSetNotice(t('admin.settings.success.roleDeleted', { name: selectedRole.name }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.roleDeleteFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const saveAdminAccess = async (event) => {
    event.preventDefault()
    if (!selectedAdmin) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await Promise.all([
        adminApi.updateAdminLegacyRole(
          selectedAdmin.id,
          {
            reason: adminEditor.reason.trim(),
            role: adminEditor.legacyRole,
          },
          token,
        ),
        adminApi.updateAdminPermissions(
          selectedAdmin.id,
          {
            permissions: adminEditor.permissionCodes,
            reason: adminEditor.reason.trim(),
          },
          token,
        ),
        adminApi.setUserAdminRoles(selectedAdmin.id, adminEditor.roleIds, token),
      ])
      await loadSettings()
      onSetNotice(t('admin.settings.success.adminAccessSaved', { email: selectedAdmin.email }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.adminSaveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const setAdminStatus = async (status) => {
    if (!selectedAdmin) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      const payload = {
        ids: [selectedAdmin.id],
        reason: adminEditor.reason.trim() || t('admin.settings.defaultLockReason'),
      }
      if (status === 'LOCKED') {
        await adminApi.bulkLockAdmins(payload, token)
      } else {
        await adminApi.bulkUnlockAdmins(payload, token)
      }
      await loadSettings()
      onSetNotice(t('admin.settings.success.adminStatusUpdated', { email: selectedAdmin.email }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.adminStatusFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const runAdminTwoFactor = async (action) => {
    if (!selectedAdmin) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      if (action === 'setup') {
        setTotpSetup(await adminApi.setupAdminTwoFactor(selectedAdmin.id, token))
      } else if (action === 'reset') {
        setTotpSetup(await adminApi.resetAdminTwoFactor(selectedAdmin.id, token))
      } else if (action === 'enable') {
        await adminApi.enableAdminTwoFactor(selectedAdmin.id, { code: adminEditor.verificationCode.trim() }, token)
        setTotpSetup(null)
        await loadSettings()
      } else {
        await adminApi.disableAdminTwoFactor(selectedAdmin.id, token)
        await loadSettings()
      }
      onSetNotice(t('admin.settings.success.twoFAProcessed', { email: selectedAdmin.email }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.twoFAFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const revokeAdminSession = async (sessionId) => {
    if (!selectedAdmin) {
      return
    }

    setSubmitting(true)
    setViewError('')
    try {
      await adminApi.revokeAdminSession(selectedAdmin.id, sessionId, token)
      setAdminSessions(await adminApi.getAdminSessions(selectedAdmin.id, token))
      onSetNotice(t('admin.settings.success.sessionRevoked', { id: sessionId }))
    } catch (err) {
      setViewError(err.message || t('admin.settings.error.sessionRevokeFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    adminEditor,
    adminSessions,
    admins,
    deleteRole,
    permissions,
    revokeAdminSession,
    roleDraft,
    roles,
    runAdminTwoFactor,
    saveAdminAccess,
    saveRole,
    selectRoleForEdit,
    selectedAdmin,
    selectedAdminId,
    selectedRole,
    selectedRoleId,
    setAdminEditor,
    setAdminSessions,
    setAdminStatus,
    setAdmins,
    setPermissions,
    setRoleDraft,
    setRoles,
    setSelectedAdminId,
    setSelectedRoleId,
    setTotpSetup,
    togglePermission,
    totpSetup,
  }
}
