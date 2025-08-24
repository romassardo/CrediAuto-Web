-- Crediexpress Auto — Fase 1–2 DB Setup (MySQL 8)
-- Fecha: 2025-08-21
-- Contiene M1 (F1) y M2 (F2) según Docs/DB-Modelo-F1-F2.md
-- Decisiones clave: email único global y en minúsculas, invitación para setear contraseña, soft delete con deletedAt, tokens por hash.

-- Recomendado: ejecutar con un usuario con permisos de CREATE/ALTER en el schema de destino.

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS `crediauto`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE `crediauto`;

-- M1 (Fase 1): dealers, users, audit_log

-- Tabla: dealers
CREATE TABLE IF NOT EXISTS `dealers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `publicId` CHAR(36) NOT NULL,
  `legalName` VARCHAR(255) NULL,
  `tradeName` VARCHAR(255) NOT NULL,
  `cuit` VARCHAR(20) NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `addressStreet` VARCHAR(255) NULL,
  `addressCity` VARCHAR(120) NULL,
  `addressProvince` VARCHAR(120) NULL,
  `postalCode` VARCHAR(20) NULL,
  `status` ENUM('PENDING_APPROVAL','APPROVED','REJECTED','SUSPENDED') NOT NULL DEFAULT 'PENDING_APPROVAL',
  `approvedAt` DATETIME NULL,
  `approvedByUserId` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dealers_publicId` (`publicId`),
  UNIQUE KEY `uq_dealers_cuit` (`cuit`),
  KEY `idx_dealers_status` (`status`),
  KEY `idx_dealers_approvedByUserId` (`approvedByUserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: users (email único global, forzado en minúsculas por CHECK)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `publicId` CHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `firstName` VARCHAR(120) NOT NULL,
  `lastName` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `passwordHash` VARCHAR(255) NULL,
  `role` ENUM('ADMIN','DEALER') NOT NULL DEFAULT 'DEALER',
  `status` ENUM('PENDING','INVITED','ACTIVE','SUSPENDED') NOT NULL DEFAULT 'PENDING',
  `dealerId` INT NULL,
  `lastLoginAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_publicId` (`publicId`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_dealerId` (`dealerId`),
  KEY `idx_users_status` (`status`),
  CONSTRAINT `chk_users_email_lower` CHECK (`email` = LOWER(`email`)),
  CONSTRAINT `fk_users_dealerId` FOREIGN KEY (`dealerId`) REFERENCES `dealers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Agregar FK de dealers.approvedByUserId -> users.id (separado para evitar ciclo en creación)
ALTER TABLE `dealers`
  ADD CONSTRAINT `fk_dealers_approvedByUserId` FOREIGN KEY (`approvedByUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Tabla: audit_log
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `actorUserId` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entityType` VARCHAR(100) NOT NULL,
  `entityId` VARCHAR(100) NOT NULL,
  `metadata` JSON NULL,
  `ip` VARCHAR(45) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_entity` (`entityType`, `entityId`),
  KEY `idx_audit_actor` (`actorUserId`),
  KEY `idx_audit_createdAt` (`createdAt`),
  CONSTRAINT `fk_audit_actorUserId` FOREIGN KEY (`actorUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- M2 (Fase 2): tokens (refresh, password reset)

-- Tabla: refresh_tokens (hash en ASCII binario; se recomienda SHA-256/512)
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `tokenHash` VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `expiresAt` DATETIME NOT NULL,
  `revokedAt` DATETIME NULL,
  `replacedByTokenId` INT NULL,
  `userAgent` VARCHAR(255) NULL,
  `ip` VARCHAR(45) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_refresh_tokenHash` (`tokenHash`),
  KEY `idx_refresh_user_revoked` (`userId`, `revokedAt`),
  KEY `idx_refresh_expiresAt` (`expiresAt`),
  CONSTRAINT `fk_refresh_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_refresh_replacedBy` FOREIGN KEY (`replacedByTokenId`) REFERENCES `refresh_tokens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: password_reset_tokens (para invitación y reset)
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `tokenHash` VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `expiresAt` DATETIME NOT NULL,
  `consumedAt` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_prt_tokenHash` (`tokenHash`),
  KEY `idx_prt_user` (`userId`),
  KEY `idx_prt_expiresAt` (`expiresAt`),
  CONSTRAINT `fk_prt_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- email_verification_tokens: NO requerido en Fase 2 (reservado para futuro si se pide verificación de email)

-- Notas:
-- - Este script asume base nueva. Si lo ejecutas repetidamente, las ALTER pueden fallar si las constraints ya existen.
-- - A nivel aplicación, asegúrate de guardar `email` en minúsculas (el CHECK lo exige).
-- - `publicId` debe ser UUID generado por la app; no se define DEFAULT aquí por portabilidad.
