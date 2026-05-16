package com.univoyage.admin.audit.repository;

import com.univoyage.admin.audit.model.CmsAuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CmsAuditLogRepository
    extends
      JpaRepository<CmsAuditLogEntity, Long>,
      JpaSpecificationExecutor<CmsAuditLogEntity> {
}
