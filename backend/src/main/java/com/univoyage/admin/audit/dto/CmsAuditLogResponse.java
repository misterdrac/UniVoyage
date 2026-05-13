package com.univoyage.admin.audit.dto;

import com.univoyage.admin.audit.model.CmsAuditEventType;

import java.time.Instant;

public record CmsAuditLogResponse(Long id, Instant createdAt, CmsAuditEventType eventType,
    Long actorUserId, String actorEmail, Long targetUserId, String targetEmail, String ipAddress,
    String metadata) {
}
