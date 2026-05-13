package com.univoyage.admin.audit.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.univoyage.admin.audit.dto.CmsAuditLogResponse;
import com.univoyage.admin.audit.model.CmsAuditEventType;
import com.univoyage.admin.audit.model.CmsAuditLogEntity;
import com.univoyage.admin.audit.repository.CmsAuditLogRepository;
import com.univoyage.user.model.Role;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CmsAuditService {

  private final CmsAuditLogRepository repository;
  private final ObjectMapper objectMapper;

  @Transactional(readOnly = true)
  public Page<CmsAuditLogResponse> list(String search, CmsAuditEventType eventTypeFilter,
      Pageable pageable) {
    Specification<CmsAuditLogEntity> spec = buildSpec(search, eventTypeFilter);
    return repository.findAll(spec, pageable).map(this::toResponse);
  }

  private Specification<CmsAuditLogEntity> buildSpec(String search, CmsAuditEventType eventType) {
    return (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();
      if (eventType != null) {
        predicates.add(cb.equal(root.get("eventType"), eventType));
      }
      if (search != null && !search.isBlank()) {
        String pattern = "%" + search.toLowerCase().trim() + "%";
        List<Predicate> textOr = new ArrayList<>();
        textOr.add(cb.like(
            cb.lower(cb.coalesce(root.get("actorEmail"), cb.literal(""))),
            pattern));
        textOr.add(cb.like(
            cb.lower(cb.coalesce(root.get("targetEmail"), cb.literal(""))),
            pattern));
        textOr.add(cb.like(
            cb.lower(cb.coalesce(root.get("ipAddress"), cb.literal(""))),
            pattern));
        textOr.add(cb.like(
            cb.lower(cb.coalesce(root.get("metadata"), cb.literal(""))),
            pattern));
        textOr.add(cb.like(cb.lower(root.get("eventType").as(String.class)), pattern));
        predicates.add(cb.or(textOr.toArray(Predicate[]::new)));
      }
      if (predicates.isEmpty()) {
        return cb.conjunction();
      }
      return cb.and(predicates.toArray(Predicate[]::new));
    };
  }

  @Transactional
  public void recordAdminLoginSuccess(Long userId, String email, String ip, String authMethod) {
    Map<String, Object> meta = new LinkedHashMap<>();
    meta.put("authMethod", authMethod);
    persist(CmsAuditEventType.ADMIN_LOGIN_SUCCESS, userId, email, null, null, ip, meta);
  }

  @Transactional
  public void recordAdminLoginFailed(String email, String ip) {
    Map<String, Object> meta = Map.of("reason", "invalid_credentials");
    persist(CmsAuditEventType.ADMIN_LOGIN_FAILED, null, email, null, null, ip, meta);
  }

  @Transactional
  public void recordAdminLogout(Long userId, String email, String ip) {
    persist(CmsAuditEventType.ADMIN_LOGOUT, userId, email, null, null, ip, Map.of());
  }

  @Transactional
  public void recordRoleChange(Long actorUserId, String actorEmail, Long targetUserId,
      String targetEmail, Role fromRole, Role toRole, String ip) {
    Map<String, Object> meta =
        new LinkedHashMap<>(Map.of("fromRole", fromRole.name(), "toRole", toRole.name()));
    persist(CmsAuditEventType.USER_ROLE_CHANGED, actorUserId, actorEmail, targetUserId, targetEmail,
        ip, meta);
  }

  private void persist(CmsAuditEventType eventType, Long actorUserId, String actorEmail,
      Long targetUserId, String targetEmail, String ip, Map<String, ?> metadataMap) {
    String metaJson = toJson(metadataMap);
    CmsAuditLogEntity row = CmsAuditLogEntity.builder().createdAt(Instant.now()).eventType(eventType)
        .actorUserId(actorUserId).actorEmail(actorEmail).targetUserId(targetUserId)
        .targetEmail(targetEmail).ipAddress(ip).metadata(metaJson).build();
    repository.save(row);
  }

  private String toJson(Map<String, ?> metadataMap) {
    try {
      return objectMapper.writeValueAsString(metadataMap);
    } catch (JsonProcessingException e) {
      return "{}";
    }
  }

  private CmsAuditLogResponse toResponse(CmsAuditLogEntity e) {
    return new CmsAuditLogResponse(e.getId(), e.getCreatedAt(), e.getEventType(),
        e.getActorUserId(), e.getActorEmail(), e.getTargetUserId(), e.getTargetEmail(),
        e.getIpAddress(), e.getMetadata());
  }
}
