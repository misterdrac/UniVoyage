package com.univoyage.admin.audit.controller;

import com.univoyage.admin.audit.dto.CmsAuditLogResponse;
import com.univoyage.admin.audit.model.CmsAuditEventType;
import com.univoyage.admin.audit.service.CmsAuditService;
import com.univoyage.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only audit trail for CMS (admin) actions. Writes occur from auth and
 * admin user flows.
 */
@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
public class AdminAuditLogController {

  private final CmsAuditService cmsAuditService;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<CmsAuditLogResponse>>> list(
      @RequestParam(required = false) String search,
      @RequestParam(required = false) CmsAuditEventType eventType,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(cmsAuditService.list(search, eventType, pageable)));
  }
}
