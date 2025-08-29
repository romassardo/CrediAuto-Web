-- Crear usuario dealer@test.com con contraseña hasheada
-- Contraseña: dealer123

-- Primero crear el concesionario
INSERT INTO dealers (publicId, tradeName, status, createdAt, updatedAt) 
VALUES (UUID(), 'Concesionario Test', 'APPROVED', NOW(), NOW());

-- Obtener el ID del concesionario recién creado
SET @dealer_id = LAST_INSERT_ID();

-- Crear el usuario dealer vinculado al concesionario
INSERT INTO users (
    publicId, 
    email, 
    firstName, 
    lastName, 
    passwordHash, 
    role, 
    status, 
    dealerId, 
    createdAt, 
    updatedAt
) VALUES (
    UUID(),
    'dealer@test.com',
    'Dealer',
    'Test',
    '$2a$12$8K1p3.6hwQNORGtlyNot4.Vx4BT6YxVpdAR6sAr2TXHkxqfNfJd1e', -- dealer123 hasheado
    'DEALER',
    'ACTIVE',
    @dealer_id,
    NOW(),
    NOW()
);

-- Verificar que se creó correctamente
SELECT u.email, u.role, u.status, d.tradeName 
FROM users u 
LEFT JOIN dealers d ON u.dealerId = d.id 
WHERE u.email = 'dealer@test.com';
