package com.univoyage.reference.language.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a Language with its code and name.
 */
@Entity
@Table(name = "languages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Language {

  @Id
  @Column(name = "lang_code", length = 2)
  private String langCode;

  @Column(name = "lang_name", unique = true, nullable = false, length = 50)
  private String langName;

  @Column(name = "emoji", length = 32)
  private String emoji;

  @Column(name = "sort_order", nullable = false)
  @Builder.Default
  private Integer sortOrder = 0;

  @Column(name = "active", nullable = false)
  @Builder.Default
  private boolean active = true;

}
