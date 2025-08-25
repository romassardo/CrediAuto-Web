-- Usuarios de prueba para CrediAuto
-- Ejecutar después de crediauto_f1_f2.sql

USE `crediauto`;

-- Insertar dealer de prueba
INSERT INTO `dealers` (
  `publicId`, 
  `legalName`, 
  `tradeName`, 
  `cuit`, 
  `email`, 
  `phone`, 
  `addressStreet`, 
  `addressCity`, 
  `addressProvince`, 
  `postalCode`, 
  `status`, 
  `approvedAt`, 
  `createdAt`
) VALUES (
  'dealer-test-001', 
  'Concesionario Test S.A.', 
  'AutoCenter Test', 
  '20-12345678-9', 
  'test@concesionario.com', 
  '+54 11 1234-5678', 
  'Av. Libertador 1234', 
  'Buenos Aires', 
  'CABA', 
  '1425', 
  'APPROVED', 
  NOW(), 
  NOW()
);

-- Obtener el ID del dealer insertado
SET @dealer_id = LAST_INSERT_ID();

-- Usuario ADMIN del sistema
INSERT INTO `users` (
  `publicId`, 
  `email`, 
  `firstName`, 
  `lastName`, 
  `phone`, 
  `passwordHash`, 
  `role`, 
  `status`, 
  `dealerId`, 
  `createdAt`
) VALUES (
  'admin-001', 
  'admin@crediauto.com', 
  'Admin', 
  'Sistema', 
  '+54 11 9999-0000', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2JVSQvqjG6', -- password: admin123
  'ADMIN', 
  'ACTIVE', 
  NULL, 
  NOW()
);

-- Usuario DEALER (concesionario)
INSERT INTO `users` (
  `publicId`, 
  `email`, 
  `firstName`, 
  `lastName`, 
  `phone`, 
  `passwordHash`, 
  `role`, 
  `status`, 
  `dealerId`, 
  `createdAt`
) VALUES (
  'dealer-001', 
  'dealer@test.com', 
  'Juan', 
  'Pérez', 
  '+54 11 5555-1234', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2JVSQvqjG6', -- password: dealer123
  'DEALER', 
  'ACTIVE', 
  @dealer_id, 
  NOW()
);

-- Usuario EJECUTIVO_CUENTAS
INSERT INTO `users` (
  `publicId`, 
  `email`, 
  `firstName`, 
  `lastName`, 
  `phone`, 
  `passwordHash`, 
  `role`, 
  `status`, 
  `dealerId`, 
  `createdAt`
) VALUES (
  'ejecutivo-001', 
  'ejecutivo@test.com', 
  'María', 
  'González', 
  '+54 11 5555-5678', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2JVSQvqjG6', -- password: ejecutivo123
  'EJECUTIVO_CUENTAS', 
  'ACTIVE', 
  @dealer_id, 
  NOW()
);

-- Actualizar el dealer con el usuario que lo aprobó (admin)
UPDATE `dealers` 
SET `approvedByUserId` = (SELECT `id` FROM `users` WHERE `email` = 'admin@crediauto.com')
WHERE `id` = @dealer_id;
