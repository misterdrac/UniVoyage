package com.univoyage.admin.audit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "cms_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CmsAuditLogEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Enumerated(EnumType.STRING)
  @Column(name = "event_type", nullable = false, length = 64)
  private CmsAuditEventType eventType;

  @Column(name = "actor_user_id")
  private Long actorUserId;

  @Column(name = "actor_email")
  private String actorEmail;

  @Column(name = "target_user_id")
  private Long targetUserId;

  @Column(name = "target_email")
  private String targetEmail;

  @Column(name = "ip_address", length = 45)
  private String ipAddress;

  @Column(columnDefinition = "TEXT")
  private String metadata;
}
