package com.univoyage.admin.audit.model;

/**
 * CMS security and account events persisted for the admin audit dashboard.
 */
public enum CmsAuditEventType {
  ADMIN_LOGIN_SUCCESS, ADMIN_LOGIN_FAILED, ADMIN_LOGOUT, USER_ROLE_CHANGED,
}
