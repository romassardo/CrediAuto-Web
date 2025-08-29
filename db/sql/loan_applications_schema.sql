-- Esquema para Solicitudes de Préstamo
-- Extensión de crediauto_f1_f2.sql para Fase 3

USE `crediauto`;

-- Tabla: loan_applications
CREATE TABLE IF NOT EXISTS `loan_applications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `publicId` CHAR(36) NOT NULL,
  
  -- Relaciones
  `dealerId` INT NOT NULL,
  `executiveId` INT NULL, -- Usuario que procesó la solicitud
  `submittedByUserId` INT NOT NULL, -- Usuario que envió la solicitud
  
  -- Datos Personales del Solicitante
  `applicantFirstName` VARCHAR(100) NOT NULL,
  `applicantLastName` VARCHAR(100) NOT NULL,
  `applicantCuil` VARCHAR(15) NOT NULL,
  `applicantEmail` VARCHAR(255) NOT NULL,
  `applicantPhone` VARCHAR(50) NOT NULL,
  `applicantBirthDate` DATE NOT NULL,
  `applicantAddress` VARCHAR(255) NOT NULL,
  `applicantCity` VARCHAR(100) NOT NULL,
  `applicantProvince` VARCHAR(100) NOT NULL,
  `applicantPostalCode` VARCHAR(20) NOT NULL,
  `applicantMaritalStatus` ENUM('soltero','casado','divorciado','viudo','union_convivencial') NOT NULL,
  
  -- Datos del Cónyuge (opcional)
  `spouseFirstName` VARCHAR(100) NULL,
  `spouseLastName` VARCHAR(100) NULL,
  `spouseCuil` VARCHAR(15) NULL,
  
  -- Datos Laborales
  `employmentType` VARCHAR(100) NOT NULL,
  `employmentTypeOther` VARCHAR(255) NULL,
  `companyName` VARCHAR(255) NOT NULL,
  `companyPhone` VARCHAR(50) NOT NULL,
  `workExperience` VARCHAR(100) NOT NULL,
  
  -- Datos del Vehículo
  `vehicleCondition` ENUM('nuevo','usado') NOT NULL,
  `vehicleBrand` VARCHAR(100) NOT NULL,
  `vehicleModel` VARCHAR(100) NOT NULL,
  `vehicleYear` YEAR NOT NULL,
  `vehicleVersion` VARCHAR(255) NOT NULL,
  
  -- Cálculos del Préstamo
  `vehiclePrice` DECIMAL(12,2) NOT NULL,
  `loanAmount` DECIMAL(12,2) NOT NULL,
  `loanTermMonths` INT NOT NULL,
  `monthlyPayment` DECIMAL(10,2) NOT NULL,
  `totalAmount` DECIMAL(12,2) NOT NULL,
  `interestRate` DECIMAL(5,4) NOT NULL,
  `cftAnnual` DECIMAL(5,4) NOT NULL,
  
  -- Documentos (JSON con lista de archivos)
  `documentsMetadata` JSON NULL,
  
  -- Estado y Procesamiento
  `status` ENUM('PENDING','UNDER_REVIEW','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `statusReason` TEXT NULL,
  `reviewedAt` DATETIME NULL,
  `reviewedByUserId` INT NULL,
  
  -- Metadatos
  `submissionData` JSON NULL, -- Datos completos del formulario
  `calculationData` JSON NULL, -- Datos completos del cálculo
  
  -- Timestamps
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_loan_applications_publicId` (`publicId`),
  KEY `idx_loan_applications_dealer` (`dealerId`),
  KEY `idx_loan_applications_status` (`status`),
  KEY `idx_loan_applications_submitted_by` (`submittedByUserId`),
  KEY `idx_loan_applications_cuil` (`applicantCuil`),
  KEY `idx_loan_applications_created` (`createdAt`),
  
  CONSTRAINT `fk_loan_applications_dealer` FOREIGN KEY (`dealerId`) REFERENCES `dealers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_loan_applications_executive` FOREIGN KEY (`executiveId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_loan_applications_submitted_by` FOREIGN KEY (`submittedByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_loan_applications_reviewed_by` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: loan_application_documents (para archivos subidos)
CREATE TABLE IF NOT EXISTS `loan_application_documents` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `loanApplicationId` INT NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `originalName` VARCHAR(255) NOT NULL,
  `fileSize` INT NOT NULL,
  `mimeType` VARCHAR(100) NOT NULL,
  `filePath` VARCHAR(500) NOT NULL,
  `documentType` ENUM('dni','salary_receipt','work_certificate','income_proof','vehicle_title','vehicle_invoice','vehicle_photos','other') NOT NULL DEFAULT 'other',
  `uploadedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_loan_docs_application` (`loanApplicationId`),
  KEY `idx_loan_docs_type` (`documentType`),
  
  CONSTRAINT `fk_loan_docs_application` FOREIGN KEY (`loanApplicationId`) REFERENCES `loan_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla: loan_application_status_history (historial de cambios de estado)
CREATE TABLE IF NOT EXISTS `loan_application_status_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `loanApplicationId` INT NOT NULL,
  `previousStatus` ENUM('PENDING','UNDER_REVIEW','APPROVED','REJECTED','CANCELLED') NULL,
  `newStatus` ENUM('PENDING','UNDER_REVIEW','APPROVED','REJECTED','CANCELLED') NOT NULL,
  `reason` TEXT NULL,
  `changedByUserId` INT NOT NULL,
  `changedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_status_history_application` (`loanApplicationId`),
  KEY `idx_status_history_changed_by` (`changedByUserId`),
  
  CONSTRAINT `fk_status_history_application` FOREIGN KEY (`loanApplicationId`) REFERENCES `loan_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_status_history_changed_by` FOREIGN KEY (`changedByUserId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
