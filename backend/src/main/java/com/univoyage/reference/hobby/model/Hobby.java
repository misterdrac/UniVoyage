package com.univoyage.reference.hobby.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a Hobby.
 */
@Entity
@Table(name = "hobbies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Hobby {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // BIGINT IDENTITY
  private Long id;

  @Column(name = "hobby_name", nullable = false, unique = true, length = 50)
  private String hobbyName;

  @Column(name = "display_label", nullable = false, length = 120)
  private String displayLabel;

  @Column(name = "emoji", length = 32)
  private String emoji;

  @Column(name = "sort_order", nullable = false)
  @Builder.Default
  private Integer sortOrder = 0;

  @Column(name = "active", nullable = false)
  @Builder.Default
  private boolean active = true;

}
