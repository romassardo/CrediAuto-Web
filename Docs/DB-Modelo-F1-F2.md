# DB — Modelo Fase 1–2 (Crediexpress Auto)

Fecha: 2025-08-21
Alcance: Esquema mínimo para Fase 1 (fundación) y Fase 2 (autenticación) con MySQL 8.
Nota: CMS (Strapi) usa su propia base separada. Este modelo es para la app core.

---

## Decisiones Base (consultado en Context7)
- IDs internos: `Int` autoincrement (`@id @default(autoincrement())`).
- IDs públicos: `uuid` para evitar enumeración (campo `publicId` con `@default(uuid())`).
- Timestamps: `createdAt @default(now())`, `updatedAt @updatedAt`.
- Soft delete: `deletedAt DateTime?` en tablas principales.
- Enums para roles/estados (mejor legibilidad que tablas lookup al inicio).
- Tokens sensibles (refresh/reset/email): almacenar HASH del token + expiración + metadata.
- Charset/collation: `utf8mb4` (emojis, multilenguaje). Tiempos en UTC.

---

## Enums
- `UserRole`: `ADMIN`, `DEALER`.
- `UserStatus`: `PENDING`, `INVITED`, `ACTIVE`, `SUSPENDED`.
- `DealerStatus`: `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `SUSPENDED`.

---

## Tablas (mínimas F1–F2)

### 1) users
- id: Int PK autoincrement
- publicId: UUID UNIQUE
- email: String UNIQUE (lowercased, único global)
- firstName: String
- lastName: String
- phone: String NULLABLE
- passwordHash: String NULLABLE (bcrypt)
- role: UserRole (DEFAULT `DEALER`)
- status: UserStatus (DEFAULT `PENDING`)
- dealerId: Int FK → dealers.id NULLABLE (admins sin dealer)
- lastLoginAt: DateTime NULLABLE
- createdAt: DateTime DEFAULT now()
- updatedAt: DateTime @updatedAt
- deletedAt: DateTime NULLABLE

Índices: UNIQUE(email), INDEX(dealerId), INDEX(status)

Relaciones: users.dealerId → dealers.id (ON DELETE SET NULL)

---

### 2) dealers
- id: Int PK autoincrement
- publicId: UUID UNIQUE
- legalName: String NULLABLE (razón social)
- tradeName: String (nombre comercial)
- cuit: String UNIQUE NULLABLE (formato validado en app; opcional en registro)
- email: String NULLABLE
- phone: String NULLABLE
- addressStreet: String NULLABLE
- addressCity: String NULLABLE
- addressProvince: String NULLABLE
- postalCode: String NULLABLE
- status: DealerStatus (DEFAULT `PENDING_APPROVAL`)
- approvedAt: DateTime NULLABLE
- approvedByUserId: Int FK → users.id NULLABLE
- createdAt: DateTime DEFAULT now()
- updatedAt: DateTime @updatedAt
- deletedAt: DateTime NULLABLE

Índices: UNIQUE(cuit), INDEX(status), INDEX(approvedByUserId)

Relaciones: dealers.approvedByUserId → users.id (ON DELETE SET NULL)

---

### 3) refresh_tokens
- id: Int PK autoincrement
- userId: Int FK → users.id
- tokenHash: String UNIQUE (hash del refresh token)
- expiresAt: DateTime
- revokedAt: DateTime NULLABLE
- replacedByTokenId: Int FK → refresh_tokens.id NULLABLE
- userAgent: String NULLABLE
- ip: String NULLABLE
- createdAt: DateTime DEFAULT now()

Índices: UNIQUE(tokenHash), INDEX(userId, revokedAt), INDEX(expiresAt)

Relaciones: ON DELETE CASCADE (si se borra user, tokens caen)

---

### 4) email_verification_tokens (no requerido en Fase 2; reservado para futuro)
- id: Int PK autoincrement
- userId: Int FK → users.id
- tokenHash: String UNIQUE
- expiresAt: DateTime
- consumedAt: DateTime NULLABLE
- createdAt: DateTime DEFAULT now()

Índices: UNIQUE(tokenHash), INDEX(userId), INDEX(expiresAt)
Relaciones: ON DELETE CASCADE

---

### 5) password_reset_tokens
- id: Int PK autoincrement
- userId: Int FK → users.id
- tokenHash: String UNIQUE
- expiresAt: DateTime
- consumedAt: DateTime NULLABLE
- createdAt: DateTime DEFAULT now()

Índices: UNIQUE(tokenHash), INDEX(userId), INDEX(expiresAt)
Relaciones: ON DELETE CASCADE

---

### 6) audit_log
- id: Int PK autoincrement
- actorUserId: Int FK → users.id NULLABLE
- action: String (ej.: `dealer.approve`, `auth.login`)
- entityType: String (ej.: `dealer`, `user`)
- entityId: String (usar `publicId` de la entidad)
- metadata: JSON NULLABLE (detalles)
- ip: String NULLABLE
- createdAt: DateTime DEFAULT now()

Índices: INDEX(entityType, entityId), INDEX(actorUserId), INDEX(createdAt)
Relaciones: ON DELETE SET NULL

---

## Tablas para fases posteriores (no incluídas ahora)
- `requests` (solicitudes): core Fase 3 (workflow, estados, PDF, cálculos).
- `vehicles`: soporte a solicitudes y catálogos.
- `files/uploads`: documentación del cliente.

Motivo: Evitar migraciones innecesarias hasta cerrar el diseño funcional del portal (F3).

---

## Relaciones (ER) resumen
- 1 dealer — N users (users.dealerId)
- 1 user — N refresh_tokens
- 1 user — N email_verification_tokens
- 1 user — N password_reset_tokens
- 1 user (opcional) — N audit_log (actor)

---

## Reglas y Constraints
- Emails en `users` únicos y en minúsculas.
- CUIT en `dealers` único.
- Tokens: guardar solo hash (no texto plano). Hash recomendado: SHA-256/512 con salt.
- `deletedAt` implica filtrado por defecto en consultas (soft delete pattern).

---

## Roadmap de Migraciones
- M1 (F1): `dealers`, `users`, `audit_log`.
- M2 (F2): `refresh_tokens`, `password_reset_tokens` + índices. Nota: `email_verification_tokens` opcional (no requerido en F2).
- M3 (F3): `requests`, `vehicles`, `files`, estados y relaciones.

---

## Notas de Seguridad
- Rate limiting en login/registro (evitar brute-force). Registrar IP/UserAgent en tokens.
- Políticas de contraseña (longitud, complejidad) + bloqueo temporal por intentos fallidos.
- Cookies httpOnly/secure para refresh donde aplique; access tokens de corta vida.

---

## Próximo Paso
Si se aprueba este modelo, generaré `schema.prisma` y las migraciones M1–M2 con Prisma, y documentaré comandos en `README.md`.
