# 🛠️ Arsitektur Backend — Dapur Nusantara (NestJS + Prisma)

Dokumen ini mencakup rancangan lengkap backend menggunakan **NestJS** dan **Prisma ORM** untuk mendukung frontend Dapur Nusantara. NestJS dipilih karena arsitekturnya yang modular, built-in dependency injection, TypeScript-first, dan sangat cocok untuk membangun REST API yang terstruktur.

---

## 🎯 Tujuan Backend

| Kebutuhan | Status Frontend Saat Ini | Solusi Backend |
|---|---|---|
| Data resep dinamis | Hardcoded `data/recipes.ts` (5 resep) | PostgreSQL + Prisma + CRUD API |
| Autentikasi pengguna | Halaman profil statis | JWT Auth + Google OAuth (Passport.js) |
| Simpan resep favorit | UI saja, tidak tersimpan | `GET/POST/DELETE /users/me/favorites` |
| Perencana makan | Data `SCHEDULE` hardcoded | `GET/PUT /journals/week` |
| Newsletter | Form tanpa backend | `POST /newsletter/subscribe` |
| Upload gambar resep | Gambar statis di `/public` | Cloudinary via `@nestjs/multer` |
| Rating & review | Data statis | `GET/POST /recipes/:slug/reviews` |
| **Video tutorial berbayar** | **Tidak ada** | **Beli akses → Midtrans → tonton video** |

---

## 🏗️ Tech Stack Backend

| Lapisan | Teknologi | Alasan |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Ekosistem luas, TypeScript native |
| **Framework** | **NestJS 10** | Modular, DI container, decorator-based, enterprise-grade |
| **Bahasa** | TypeScript strict | Full type-safety end-to-end |
| **Database** | PostgreSQL 16 | Relasional, cocok untuk data resep & relasi kompleks |
| **ORM** | **Prisma 5** | Type-safe query builder, auto-generated client, migrasi mudah |
| **Auth** | `@nestjs/jwt` + `@nestjs/passport` | JWT stateless + strategi Passport terintegrasi |
| **OAuth** | `passport-google-oauth20` | Login Google (sudah ada di UI profil) |
| **File Storage** | Cloudinary + `multer` | Upload & optimasi gambar resep |
| **Cache** | Redis + `@nestjs/cache-manager` | Cache resep populer, blacklist token |
| **Validasi** | `class-validator` + `class-transformer` | DTO validation terintegrasi dengan NestJS Pipe |
| **Konfigurasi** | `@nestjs/config` + Joi | Validasi env variables saat startup |
| **Dokumentasi API** | `@nestjs/swagger` | Auto-generate Swagger UI dari dekorator |
| **Payment Gateway** | **Midtrans Snap** | Pembayaran lokal Indonesia (GoPay, QRIS, VA Bank, kartu) |
| **Video Delivery** | Cloudinary (signed URL) | URL video private, expired setelah 1 jam |
| **Testing** | Jest + Supertest | Unit test & e2e test bawaan NestJS |

---

## 📁 Struktur Folder NestJS

```
backend-resep/
├── src/
│   ├── main.ts                        ← Bootstrap app, global pipes, Swagger
│   ├── app.module.ts                  ← Root module: import semua module
│   ├── app.controller.ts              ← Health check endpoint
│   │
│   ├── prisma/                        ← Prisma sebagai NestJS service
│   │   ├── prisma.module.ts           ← @Global() module
│   │   └── prisma.service.ts          ← extends PrismaClient, onModuleInit
│   │
│   ├── redis/
│   │   ├── redis.module.ts
│   │   └── redis.service.ts           ← Wrapper Redis client
│   │
│   ├── config/
│   │   └── configuration.ts           ← Config factory (JWT_SECRET, DB_URL, dll)
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts         ← /api/auth/*
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts        ← Validasi accessToken
│   │   │   ├── jwt-refresh.strategy.ts ← Validasi refreshToken
│   │   │   └── google.strategy.ts     ← Google OAuth 2.0
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts      ← @UseGuards(JwtAuthGuard)
│   │   │   ├── jwt-refresh.guard.ts
│   │   │   └── google-auth.guard.ts
│   │   └── dto/
│   │       ├── register.dto.ts        ← class-validator decorators
│   │       ├── login.dto.ts
│   │       └── refresh-token.dto.ts
│   │
│   ├── recipes/
│   │   ├── recipes.module.ts
│   │   ├── recipes.controller.ts      ← /api/recipes/*
│   │   ├── recipes.service.ts
│   │   └── dto/
│   │       ├── create-recipe.dto.ts
│   │       ├── update-recipe.dto.ts
│   │       └── query-recipe.dto.ts    ← Filter, sort, pagination
│   │
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts   ← /api/categories/*
│   │   ├── categories.service.ts
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       └── update-category.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts        ← /api/users/me/*
│   │   ├── users.service.ts
│   │   └── dto/
│   │       └── update-user.dto.ts
│   │
│   ├── reviews/
│   │   ├── reviews.module.ts
│   │   ├── reviews.controller.ts      ← /api/recipes/:slug/reviews
│   │   ├── reviews.service.ts
│   │   └── dto/
│   │       └── create-review.dto.ts
│   │
│   ├── journals/
│   │   ├── journals.module.ts
│   │   ├── journals.controller.ts     ← /api/journals/*
│   │   ├── journals.service.ts
│   │   └── dto/
│   │       └── update-journal.dto.ts
│   │
│   ├── newsletter/
│   │   ├── newsletter.module.ts
│   │   ├── newsletter.controller.ts   ← /api/newsletter/*
│   │   ├── newsletter.service.ts
│   │   └── dto/
│   │       └── subscribe.dto.ts
│   │
│   ├── uploads/
│   │   ├── uploads.module.ts
│   │   ├── uploads.controller.ts      ← /api/uploads/*
│   │   └── uploads.service.ts         ← Cloudinary integration
│   │
│   ├── tutorials/
│   │   ├── tutorials.module.ts
│   │   ├── tutorials.controller.ts    ← /api/tutorials/*
│   │   ├── tutorials.service.ts
│   │   ├── guards/
│   │   │   └── tutorial-access.guard.ts  ← Cek user sudah bayar?
│   │   └── dto/
│   │       ├── create-tutorial.dto.ts
│   │       └── update-tutorial.dto.ts
│   │
│   ├── payments/
│   │   ├── payments.module.ts
│   │   ├── payments.controller.ts     ← /api/payments/*
│   │   ├── payments.service.ts        ← Midtrans integration
│   │   ├── midtrans/
│   │   │   ├── midtrans.service.ts    ← Snap API wrapper
│   │   │   └── midtrans.types.ts      ← Midtrans type definitions
│   │   └── dto/
│   │       ├── create-payment.dto.ts
│   │       └── midtrans-webhook.dto.ts ← Verifikasi notifikasi Midtrans
│   │
│   └── common/                        ← Shared utilities
│       ├── decorators/
│       │   ├── current-user.decorator.ts  ← @CurrentUser()
│       │   ├── roles.decorator.ts         ← @Roles('ADMIN')
│       │   └── public.decorator.ts        ← @Public() skip auth
│       ├── guards/
│       │   └── roles.guard.ts             ← Role-based access control
│       ├── filters/
│       │   └── http-exception.filter.ts   ← Global error response format
│       ├── interceptors/
│       │   ├── response.interceptor.ts    ← Standar format JSON response
│       │   └── logging.interceptor.ts     ← Log setiap request
│       ├── pipes/
│       │   └── parse-slug.pipe.ts
│       └── dto/
│           └── pagination.dto.ts          ← @IsOptional page, limit, sort
│
├── prisma/
│   ├── schema.prisma                  ← Schema database lengkap
│   ├── seed.ts                        ← Seed dari data/recipes.ts frontend
│   └── migrations/                    ← Auto-generated Prisma migrations
│
├── test/
│   ├── auth.e2e-spec.ts
│   ├── recipes.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## 🗃️ Diagram Arsitektur Modul NestJS

```mermaid
graph TD
    subgraph Bootstrap["🚀 main.ts — Bootstrap"]
        M["NestFactory.create(AppModule)"]
        SW["Swagger setup"]
        GP["Global Pipes: ValidationPipe"]
        GF["Global Filters: HttpExceptionFilter"]
        GI["Global Interceptors: ResponseInterceptor"]
    end

    subgraph Root["📦 AppModule (Root)"]
        direction LR
        CM["ConfigModule.forRoot()"]
        PM["PrismaModule @Global"]
        RM["RedisModule @Global"]
    end

    subgraph Feature["🧩 Feature Modules"]
        direction LR
        AU["AuthModule"]
        RE["RecipesModule"]
        CA["CategoriesModule"]
        US["UsersModule"]
        RV["ReviewsModule"]
        JO["JournalsModule"]
        NL["NewsletterModule"]
        UP["UploadsModule"]
    end

    subgraph Common["🔧 Common / Shared"]
        direction LR
        DEC["Decorators\\n@CurrentUser @Roles @Public"]
        GU["Guards\\nJwtAuthGuard RolesGuard"]
        FI["Filters\\nHttpExceptionFilter"]
        IN["Interceptors\\nResponseInterceptor"]
    end

    M --> Root
    Root --> Feature
    Feature --> Common
    AU --> |"JWT Strategies"| GU
```

---

## 🔑 Anatomi Satu Module NestJS (Contoh: Recipes)

```mermaid
graph LR
    subgraph RM["RecipesModule"]
        direction TB
        RC["RecipesController\\n@Controller('recipes')"]
        RS["RecipesService\\n@Injectable()"]
        DT["DTO Classes\\ncreate-recipe.dto.ts\\nquery-recipe.dto.ts"]
    end

    subgraph Deps["Injected Dependencies"]
        PR["PrismaService"]
        RD["RedisService"]
        CL["CloudinaryService"]
    end

    subgraph Endpoints["Endpoints"]
        direction TB
        E1["@Get() findAll()"]
        E2["@Get(':slug') findOne()"]
        E3["@Post() @UseGuards(JwtAuthGuard) create()"]
        E4["@Put(':slug') update()"]
        E5["@Delete(':slug') remove()"]
    end

    RC --> RS
    RS --> Deps
    RC --> Endpoints
    Endpoints --> DT
```

---

## 🗄️ Schema Database (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USER ───────────────────────────────────────────────
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  avatar        String?
  password      String?           // null jika login via OAuth
  googleId      String?   @unique // ID dari Google OAuth
  role          Role      @default(USER)
  dietaryPrefs  String[]  @default([]) // ["vegan", "gluten-free", ...]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  recipes       Recipe[]
  favorites     Favorite[]
  reviews       Review[]
  journals      Journal[]
  activities    Activity[]
  newsletter    Newsletter?
  transactions  Transaction[]       // ← Riwayat transaksi pembelian tutorial

  @@map("users")
}

enum Role {
  USER
  ADMIN
}

// ─── RECIPE ─────────────────────────────────────────────
model Recipe {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  description String
  imageSrc    String
  heroSrc     String
  prepTime    Int
  cookTime    Int
  servings    Int
  calories    Int
  authorId    String
  isPublished Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  author      User              @relation(fields: [authorId], references: [id], onDelete: Cascade)
  categories  RecipeCategory[]
  tags        RecipeTag[]
  ingredients Ingredient[]
  steps       Step[]
  reviews     Review[]
  favorites   Favorite[]
  journals    JournalEntry[]

  @@map("recipes")
}

// ─── INGREDIENT ─────────────────────────────────────────
model Ingredient {
  id       String  @id @default(cuid())
  amount   String
  name     String
  note     String?
  order    Int
  recipeId String

  recipe   Recipe  @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@map("ingredients")
}

// ─── STEP ────────────────────────────────────────────────
model Step {
  id       String @id @default(cuid())
  step     Int
  title    String
  text     String
  icon     String
  recipeId String

  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@map("steps")
}

// ─── CATEGORY ────────────────────────────────────────────
model Category {
  id           String           @id @default(cuid())
  slug         String           @unique
  name         String
  description  String
  emoji        String
  color        String
  colorEnd     String
  textColor    String
  featuredTag  String
  highlight    String
  createdAt    DateTime         @default(now())

  recipes      RecipeCategory[]

  @@map("categories")
}

// ─── RECIPE-CATEGORY (Many-to-Many) ─────────────────────
model RecipeCategory {
  recipeId   String
  categoryId String

  recipe     Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([recipeId, categoryId])
  @@map("recipe_categories")
}

// ─── RECIPE TAG ──────────────────────────────────────────
model RecipeTag {
  id       String @id @default(cuid())
  name     String
  recipeId String

  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@unique([name, recipeId])
  @@map("recipe_tags")
}

// ─── REVIEW ──────────────────────────────────────────────
model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1–5
  comment   String?
  userId    String
  recipeId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipe    Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@unique([userId, recipeId])
  @@map("reviews")
}

// ─── FAVORITE ────────────────────────────────────────────
model Favorite {
  userId    String
  recipeId  String
  savedAt   DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipe    Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@id([userId, recipeId])
  @@map("favorites")
}

// ─── JOURNAL ─────────────────────────────────────────────
model Journal {
  id        String         @id @default(cuid())
  userId    String
  weekStart DateTime
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  entries   JournalEntry[]

  @@unique([userId, weekStart])
  @@map("journals")
}

model JournalEntry {
  id        String    @id @default(cuid())
  journalId String
  recipeId  String?
  dayOfWeek Int       // 1=Senin … 5=Jumat
  mealType  MealType

  journal   Journal   @relation(fields: [journalId], references: [id], onDelete: Cascade)
  recipe    Recipe?   @relation(fields: [recipeId], references: [id], onDelete: SetNull)

  @@unique([journalId, dayOfWeek, mealType])
  @@map("journal_entries")
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
}

// ─── ACTIVITY LOG ────────────────────────────────────────
model Activity {
  id        String       @id @default(cuid())
  userId    String
  type      ActivityType
  metadata  Json?
  createdAt DateTime     @default(now())

  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("activities")
}

enum ActivityType {
  RECIPE_SAVED
  RECIPE_CREATED
  REVIEW_POSTED
  JOURNAL_UPDATED
  ACHIEVEMENT_UNLOCKED
  TUTORIAL_PURCHASED      // ← Tambahan
}

// ─── NEWSLETTER ──────────────────────────────────────────
model Newsletter {
  id           String   @id @default(cuid())
  email        String   @unique
  userId       String?  @unique
  isSubscribed Boolean  @default(true)
  subscribedAt DateTime @default(now())

  user         User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("newsletter_subscribers")
}

// ─── TUTORIAL ────────────────────────────────────────────
model Tutorial {
  id           String   @id @default(cuid())
  recipeId     String   @unique       // 1 tutorial per resep
  title        String
  description  String
  videoUrl     String                 // URL private Cloudinary (tidak dibagikan)
  thumbnailUrl String
  duration     Int                    // Dalam detik
  price        Int                    // Dalam Rupiah (cth: 29000)
  isPublished  Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  recipe       Recipe                 @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  accesses     UserTutorialAccess[]

  @@map("tutorials")
}

// ─── TRANSACTION ─────────────────────────────────────────
model Transaction {
  id            String            @id @default(cuid())
  orderId       String            @unique  // Format: TRX-{userId}-{tutorialId}-{timestamp}
  userId        String
  tutorialId    String
  amount        Int                        // Harga dalam Rupiah
  status        TransactionStatus @default(PENDING)
  paymentMethod String?                    // "gopay", "bca_va", "qris", dll
  snapToken     String?                    // Midtrans Snap token
  snapUrl       String?                    // Midtrans payment page URL
  paidAt        DateTime?
  expiredAt     DateTime?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  user          User                      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tutorial      Tutorial                  @relation(fields: [tutorialId], references: [id], onDelete: Cascade)
  access        UserTutorialAccess?

  @@map("transactions")
}

enum TransactionStatus {
  PENDING     // Belum bayar
  SUCCESS     // Pembayaran berhasil (webhook confirmed)
  FAILED      // Pembayaran gagal
  EXPIRED     // Waktu bayar habis (15 menit)
  CANCELLED   // Dibatalkan user
  REFUNDED    // Dana dikembalikan
}

// ─── USER TUTORIAL ACCESS ────────────────────────────────
model UserTutorialAccess {
  id            String    @id @default(cuid())
  userId        String
  tutorialId    String
  transactionId String    @unique
  grantedAt     DateTime  @default(now())
  expiresAt     DateTime?              // null = akses seumur hidup

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  tutorial      Tutorial    @relation(fields: [tutorialId], references: [id], onDelete: Cascade)
  transaction   Transaction @relation(fields: [transactionId], references: [id])

  @@unique([userId, tutorialId])
  @@map("user_tutorial_accesses")
}
```

---

## 🔗 Diagram Relasi Database (ERD)

```mermaid
erDiagram
    USER ||--o{ RECIPE : "membuat"
    USER ||--o{ FAVORITE : "menyimpan"
    USER ||--o{ REVIEW : "menulis"
    USER ||--o{ JOURNAL : "memiliki"
    USER ||--o{ ACTIVITY : "mencatat"
    USER ||--o| NEWSLETTER : "berlangganan"
    USER ||--o{ TRANSACTION : "melakukan"

    RECIPE ||--o{ INGREDIENT : "memiliki"
    RECIPE ||--o{ STEP : "memiliki"
    RECIPE ||--o{ REVIEW : "menerima"
    RECIPE ||--o{ FAVORITE : "disimpan oleh"
    RECIPE ||--o{ RECIPE_CATEGORY : "dikategorikan"
    RECIPE ||--o{ RECIPE_TAG : "memiliki"
    RECIPE ||--o{ JOURNAL_ENTRY : "dijadwalkan di"
    RECIPE ||--o| TUTORIAL : "memiliki tutorial"

    CATEGORY ||--o{ RECIPE_CATEGORY : "mengandung"
    JOURNAL ||--o{ JOURNAL_ENTRY : "memiliki"

    USER {
        string id PK
        string email UK
        string name
        string avatar
        string password
        string googleId UK
        enum role
        string[] dietaryPrefs
        datetime createdAt
    }

    RECIPE {
        string id PK
        string slug UK
        string title
        string description
        string imageSrc
        string heroSrc
        int prepTime
        int cookTime
        int servings
        int calories
        string authorId FK
        boolean isPublished
    }

    CATEGORY {
        string id PK
        string slug UK
        string name
        string description
        string emoji
        string color
        string colorEnd
    }

    REVIEW {
        string id PK
        int rating
        string comment
        string userId FK
        string recipeId FK
    }

    FAVORITE {
        string userId FK
        string recipeId FK
        datetime savedAt
    }

    JOURNAL {
        string id PK
        string userId FK
        datetime weekStart
    }

    JOURNAL_ENTRY {
        string id PK
        string journalId FK
        string recipeId FK
        int dayOfWeek
        enum mealType
    }

    INGREDIENT {
        string id PK
        string amount
        string name
        string note
        int order
        string recipeId FK
    }

    STEP {
        string id PK
        int step
        string title
        string text
        string icon
        string recipeId FK
    }

    ACTIVITY {
        string id PK
        string userId FK
        enum type
        json metadata
        datetime createdAt
    }

    NEWSLETTER {
        string id PK
        string email UK
        string userId FK
        boolean isSubscribed
    }

    TUTORIAL {
        string id PK
        string recipeId FK "unique - 1 tutorial per resep"
        string title
        string videoUrl
        int duration
        int price
        boolean isPublished
    }

    TRANSACTION {
        string id PK
        string orderId UK
        string userId FK
        string tutorialId FK
        int amount
        enum status
        string paymentMethod
        string snapToken
        datetime paidAt
    }

    USER_TUTORIAL_ACCESS {
        string id PK
        string userId FK
        string tutorialId FK
        string transactionId FK "unique"
        datetime grantedAt
        datetime expiresAt
    }

    TUTORIAL ||--o{ TRANSACTION : "dibeli melalui"
    TRANSACTION ||--o| USER_TUTORIAL_ACCESS : "memberikan akses"
    USER ||--o{ USER_TUTORIAL_ACCESS : "memiliki akses"
```

---

## 🔌 Desain REST API Endpoint

### 🔐 Auth (`/api/auth`)

| Method | Endpoint | Auth? | Deskripsi |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Daftar akun baru |
| `POST` | `/api/auth/login` | ❌ | Login, return accessToken + refreshToken |
| `POST` | `/api/auth/logout` | ✅ | Blacklist refreshToken di Redis |
| `POST` | `/api/auth/refresh` | ✅ RefreshGuard | Refresh accessToken |
| `GET` | `/api/auth/google` | ❌ | Redirect ke Google Consent Screen |
| `GET` | `/api/auth/google/callback` | ❌ | Callback Google OAuth → return JWT |
| `GET` | `/api/auth/me` | ✅ JwtGuard | Info user saat ini |

### 🍳 Recipes (`/api/recipes`)

| Method | Endpoint | Auth? | Deskripsi |
|---|---|---|---|
| `GET` | `/api/recipes` | ❌ | List semua resep (pagination, filter, search) |
| `GET` | `/api/recipes/popular` | ❌ | Resep paling banyak disimpan |
| `GET` | `/api/recipes/:slug` | ❌ | Detail resep berdasarkan slug |
| `POST` | `/api/recipes` | ✅ JWT | Buat resep baru |
| `PUT` | `/api/recipes/:slug` | ✅ JWT | Update resep (author/admin) |
| `DELETE` | `/api/recipes/:slug` | ✅ JWT | Hapus resep (author/admin) |
| `GET` | `/api/recipes/:slug/reviews` | ❌ | List review resep |
| `POST` | `/api/recipes/:slug/reviews` | ✅ JWT | Tambah review |

**Query params:**
```
GET /api/recipes?page=1&limit=10&category=sarapan&tag=vegan&sort=rating&q=ayam
```

### 📂 Categories (`/api/categories`)

| Method | Endpoint | Auth? | Deskripsi |
|---|---|---|---|
| `GET` | `/api/categories` | ❌ | List semua kategori |
| `GET` | `/api/categories/:slug` | ❌ | Detail + resep per kategori |
| `POST` | `/api/categories` | ✅ ADMIN | Buat kategori baru |
| `PUT` | `/api/categories/:slug` | ✅ ADMIN | Update kategori |
| `DELETE` | `/api/categories/:slug` | ✅ ADMIN | Hapus kategori |

### 👤 Users (`/api/users`)

| Method | Endpoint | Auth? | Deskripsi |
|---|---|---|---|
| `GET` | `/api/users/me` | ✅ JWT | Profil saya |
| `PUT` | `/api/users/me` | ✅ JWT | Update profil |
| `DELETE` | `/api/users/me` | ✅ JWT | Hapus akun |
| `GET` | `/api/users/me/favorites` | ✅ JWT | Resep yang disimpan |
| `POST` | `/api/users/me/favorites/:recipeId` | ✅ JWT | Simpan resep ke favorit |
| `DELETE` | `/api/users/me/favorites/:recipeId` | ✅ JWT | Hapus dari favorit |
| `GET` | `/api/users/me/recipes` | ✅ JWT | Resep yang saya buat |
| `GET` | `/api/users/me/activities` | ✅ JWT | Log aktivitas saya |

### 📓 Journals (`/api/journals`)

| Method | Endpoint | Auth? | Deskripsi |
|---|---|---|---|
| `GET` | `/api/journals/week?date=2026-05-26` | ✅ JWT | Perencana makan minggu ini |
| `PUT` | `/api/journals/week` | ✅ JWT | Update/buat entri jadwal |
| `DELETE` | `/api/journals/entry/:id` | ✅ JWT | Hapus satu entri |
| `GET` | `/api/journals/shopping-list?date=` | ✅ JWT | Buat daftar belanja otomatis |

### 📧 Newsletter + 📤 Uploads

| Method | Endpoint | Auth? | Deskripsi |
|---|---|---|---|
| `POST` | `/api/newsletter/subscribe` | ❌ | Daftar newsletter |
| `DELETE` | `/api/newsletter/unsubscribe` | ❌ | Berhenti berlangganan |
| `POST` | `/api/uploads/image` | ✅ JWT | Upload gambar → Cloudinary |

---

## 💎 Sistem Tutorial Berbayar

### 🎬 Tutorials (`/api/tutorials`)

| Method | Endpoint | Auth? | Deskripsi |
|---|---|---|---|
| `GET` | `/api/tutorials` | ❌ | List semua tutorial (info, harga, preview thumbnail) |
| `GET` | `/api/tutorials/:recipeSlug` | ❌ | Detail tutorial: judul, harga, durasi, deskripsi |
| `GET` | `/api/tutorials/:recipeSlug/watch` | ✅ JWT + HasAccess | Dapatkan signed video URL (1 jam TTL) |
| `POST` | `/api/tutorials` | ✅ ADMIN | Buat tutorial baru |
| `PUT` | `/api/tutorials/:recipeSlug` | ✅ ADMIN | Update tutorial |
| `DELETE` | `/api/tutorials/:recipeSlug` | ✅ ADMIN | Hapus tutorial |

### 💳 Payments (`/api/payments`)

| Method | Endpoint | Auth? | Deskripsi |
|---|---|---|---|
| `POST` | `/api/payments/create` | ✅ JWT | Buat transaksi + dapatkan Midtrans Snap Token |
| `POST` | `/api/payments/webhook` | ❌ (Midtrans IP only) | Callback notifikasi status dari Midtrans |
| `GET` | `/api/payments/status/:orderId` | ✅ JWT | Cek status transaksi |
| `GET` | `/api/payments/history` | ✅ JWT | Riwayat semua transaksi user |
| `GET` | `/api/users/me/tutorials` | ✅ JWT | Daftar tutorial yang sudah dibeli |

---

## 🗺️ Peta Endpoint Tutorial & Payment

```mermaid
graph LR
    Client(["\ud83d\udda5\ufe0f Next.js Client"])

    subgraph TUT["/api/tutorials"]
        direction TB
        T1["GET / \u2014 list + harga"]
        T2["GET /:slug \u2014 detail preview"]
        T3["GET /:slug/watch \u2705 HasAccess"]
        T4["POST / \u2705 ADMIN"]
        T5["PUT /:slug \u2705 ADMIN"]
    end

    subgraph PAY["/api/payments"]
        direction TB
        P1["POST /create \u2705 \u2014 buat transaksi"]
        P2["POST /webhook \u274c \u2014 Midtrans callback"]
        P3["GET /status/:orderId \u2705"]
        P4["GET /history \u2705"]
    end

    subgraph ACC["/api/users/me"]
        direction TB
        A1["GET /tutorials \u2705"]
    end

    Client --> TUT
    Client --> PAY
    Client --> ACC
    P2 -->|"Midtrans Server ONLY"| PAY
```

---

## 💳 Alur Pembelian Tutorial (Midtrans Snap)

```mermaid
sequenceDiagram
    actor U as Pengguna
    participant FE as Next.js Frontend
    participant NE as NestJS Backend
    participant MT as Midtrans Snap API
    participant DB as PostgreSQL (Prisma)

    U->>FE: Klik tombol "Beli Tutorial - Rp 29.000"
    FE->>NE: POST /api/payments/create\n{ tutorialId: "xxx" }\nAuthorization: Bearer accessToken

    NE->>NE: Cek: user sudah beli tutorial ini?

    alt Sudah punya akses
        NE-->>FE: 409 Conflict { error: "ALREADY_PURCHASED" }
        FE-->>U: Redirect langsung ke halaman tonton
    end

    NE->>DB: prisma.transaction.create({\n  orderId: "TRX-userId-tutId-1234567",\n  status: PENDING,\n  amount: 29000\n})
    DB-->>NE: Transaction record

    NE->>MT: midtrans.snap.createTransaction({\n  order_id: orderId,\n  gross_amount: 29000,\n  customer_details: { name, email },\n  item_details: [{ name: "Tutorial Ayam Goreng", price: 29000 }]\n})
    MT-->>NE: { token: "snap-token", redirect_url }

    NE->>DB: prisma.transaction.update({ snapToken, snapUrl })
    NE-->>FE: 201 Created\n{ orderId, snapToken, snapUrl }

    FE->>FE: Tampilkan Midtrans Snap Popup\n(window.snap.pay(snapToken))
    FE-->>U: Modal pembayaran Midtrans muncul
    U->>MT: Pilih metode & bayar (GoPay/QRIS/BCA VA)
    MT-->>FE: Callback onSuccess / onPending / onError
    FE->>FE: Redirect ke /tutorial/ayam-goreng?status=pending

    Note over MT,NE: Midtrans mengirim notifikasi webhook (async)
```

---

## 🔔 Alur Midtrans Webhook (Konfirmasi Pembayaran)

```mermaid
sequenceDiagram
    participant MT as Midtrans Server
    participant NE as NestJS Backend
    participant DB as PostgreSQL (Prisma)
    participant U as User (sedang menunggu)

    MT->>NE: POST /api/payments/webhook\n{ order_id, transaction_status,\n  fraud_status, signature_key, ... }

    NE->>NE: Verifikasi signature_key\nSHA512(orderId + statusCode + amount + serverKey)

    alt Signature tidak valid
        NE-->>MT: 403 Forbidden (abaikan request palsu)
    end

    NE->>NE: Cek transaction_status

    alt status = "settlement" / "capture" (fraud_status = "accept")
        NE->>DB: prisma.transaction.update({\n  status: SUCCESS, paidAt: now()\n})
        NE->>DB: prisma.userTutorialAccess.create({\n  userId, tutorialId, transactionId,\n  expiresAt: null // akses seumur hidup\n})
        NE->>DB: prisma.activity.create({\n  type: TUTORIAL_PURCHASED\n})
        NE-->>MT: 200 OK

    else status = "expire"
        NE->>DB: prisma.transaction.update({ status: EXPIRED })
        NE-->>MT: 200 OK

    else status = "cancel" / "deny"
        NE->>DB: prisma.transaction.update({ status: FAILED })
        NE-->>MT: 200 OK
    end

    Note over U: User refresh halaman → cek status via GET /payments/status/:orderId
    U->>NE: GET /api/payments/status/TRX-xxx
    NE->>DB: prisma.transaction.findUnique({ orderId })
    DB-->>NE: Transaction { status: SUCCESS }
    NE-->>U: { status: "SUCCESS" } \u2192 FE redirect ke /tutorial/watch
```

---

## 🔒 Alur Guard Akses Tutorial

```mermaid
flowchart TD
    REQ(["\ud83d\udce8 GET /api/tutorials/:slug/watch"])

    G1{"JwtAuthGuard\nApakah user login?"}
    G2{"TutorialAccessGuard\nApakah user punya akses?"}
    G3["prisma.userTutorialAccess.findUnique({\n  where: { userId, tutorialId }\n})"]
    G4{"Access record ada?"}
    G5{"expiresAt > now()\natau null?"}

    GEN["\u2705 cloudinary.url(videoUrl, {\n  sign_url: true,\n  expires_at: Date.now() + 3600\n})\n\u2192 Signed URL valid 1 jam"]

    E1(["\u274c 401 Unauthorized\nLogin terlebih dahulu"])
    E2(["\u274c 403 Forbidden\nBeli tutorial terlebih dahulu"])
    E3(["\u274c 403 Forbidden\nAkses tutorial sudah expired"])
    RES(["\u2705 200 OK { signedVideoUrl, expiresAt }"])

    REQ --> G1
    G1 -->|"Tidak login"| E1
    G1 -->|"Login \u2705"| G2
    G2 --> G3
    G3 --> G4
    G4 -->|"Tidak ada"| E2
    G4 -->|"Ada"| G5
    G5 -->|"Expired"| E3
    G5 -->|"Masih valid"| GEN
    GEN --> RES
```

---

## 🔄 State Machine Transaksi

```mermaid
stateDiagram-v2
    [*] --> PENDING : POST /payments/create\n(Midtrans Snap token dibuat)

    PENDING --> SUCCESS : Webhook: settlement / capture\n(akses tutorial diberikan)
    PENDING --> EXPIRED : Webhook: expire\n(15 menit tidak bayar)
    PENDING --> FAILED : Webhook: cancel / deny
    PENDING --> CANCELLED : User tutup popup Midtrans

    SUCCESS --> REFUNDED : Admin proses refund manual
    REFUNDED --> [*]
    FAILED --> [*]
    EXPIRED --> [*]
    CANCELLED --> [*]

    SUCCESS --> [*] : Akses tutorial aktif \u2705

    note right of SUCCESS
        prisma.userTutorialAccess.create()
        prisma.activity.create(TUTORIAL_PURCHASED)
    end note

    note right of PENDING
        snapToken tersimpan di DB
        User bisa re-open Snap popup
    end note
```

---

## 🎬 Diagram Modul Tutorial & Payment (NestJS)

```mermaid
graph TD
    subgraph TutMod["TutorialsModule"]
        TC["TutorialsController\n@Controller('tutorials')"]
        TS["TutorialsService\n@Injectable()"]
        TAG["TutorialAccessGuard\nimplements CanActivate"]
        TDTO["DTOs\ncreate-tutorial.dto\nupdate-tutorial.dto"]
    end

    subgraph PayMod["\ud83d\udcb3 PaymentsModule"]
        PC["PaymentsController\n@Controller('payments')"]
        PS["PaymentsService\n@Injectable()"]
        MS["MidtransService\n@Injectable()"]
        PDTO["DTOs\ncreate-payment.dto\nmidtrans-webhook.dto"]
    end

    subgraph Deps["\ud83d\udd17 Shared Dependencies"]
        PRS["PrismaService\n(transactions, tutorials, accesses)"]
        RDS["RedisService\n(cache tutorial list)"]
        CLD["CloudinaryService\n(signed video URL)"]        
    end

    subgraph External["\u2601\ufe0f External Services"]
        MTX["Midtrans Snap API\nhttps://api.midtrans.com"]
        CVID["Cloudinary\n(video private storage)"]
    end

    TC --> TS
    TC --> TAG
    TS --> PRS
    TS --> RDS
    TS --> CLD
    CLD --> CVID

    PC --> PS
    PS --> MS
    PS --> PRS
    MS --> MTX

    TAG -->|"cek UserTutorialAccess"| PRS
```

---

## 🗺️ Peta Endpoint API

```mermaid
graph LR
    Client(["🖥️ Next.js Client"])

    subgraph AUTH["/api/auth"]
        direction TB
        A1["POST /register"]
        A2["POST /login"]
        A3["POST /logout"]
        A4["POST /refresh"]
        A5["GET /google"]
        A6["GET /me ✅"]
    end

    subgraph RECIPES["/api/recipes"]
        direction TB
        R1["GET / — list + filter"]
        R2["GET /:slug — detail"]
        R3["POST / ✅ — buat"]
        R4["PUT /:slug ✅ — update"]
        R5["DELETE /:slug ✅ — hapus"]
        R6["GET /popular"]
        R7["GET /:slug/reviews"]
        R8["POST /:slug/reviews ✅"]
    end

    subgraph USERS["/api/users/me"]
        direction TB
        U1["GET / ✅"]
        U2["PUT / ✅"]
        U3["GET /favorites ✅"]
        U4["POST /favorites/:id ✅"]
        U5["GET /activities ✅"]
    end

    subgraph CATS["/api/categories"]
        direction TB
        C1["GET /"]
        C2["GET /:slug"]
        C3["POST / ✅ ADMIN"]
    end

    subgraph JOURNALS["/api/journals"]
        direction TB
        J1["GET /week ✅"]
        J2["PUT /week ✅"]
        J3["GET /shopping-list ✅"]
    end

    subgraph OTHER["Lainnya"]
        direction TB
        N1["POST /newsletter/subscribe"]
        P1["POST /uploads/image ✅"]
    end

    Client --> AUTH
    Client --> RECIPES
    Client --> USERS
    Client --> CATS
    Client --> JOURNALS
    Client --> OTHER
```

---

## 📤 Format Standar Response (via ResponseInterceptor)

NestJS menggunakan `Interceptor` global untuk membungkus semua response:

```typescript
// common/interceptors/response.interceptor.ts
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

```json
// ✅ Sukses (list)
{
  "success": true,
  "data": [...],
  "meta": { "page": 1, "limit": 10, "total": 47, "totalPages": 5 },
  "timestamp": "2026-05-27T12:00:00.000Z"
}

// ✅ Sukses (detail)
{
  "success": true,
  "data": { "id": "...", "slug": "ayam-goreng", ... },
  "timestamp": "2026-05-27T12:00:00.000Z"
}

// ❌ Error (via HttpExceptionFilter)
{
  "success": false,
  "error": {
    "code": "RECIPE_NOT_FOUND",
    "message": "Resep 'ayam-bakar' tidak ditemukan.",
    "details": []
  },
  "timestamp": "2026-05-27T12:00:00.000Z"
}
```

---

## ⚙️ Siklus Hidup Request di NestJS

```mermaid
flowchart TD
    REQ(["📨 HTTP Request"])

    subgraph MW["🛡️ Global Middleware"]
        direction TB
        LOG["LoggingInterceptor\nCatat req/res"]
        CORS["CORS\nvalidasi origin"]
        HELM["Helmet\nsecurity headers"]
        RATE["ThrottlerGuard\nRate limiter per IP"]
    end

    subgraph GUARD["🔒 Guards (per endpoint)"]
        direction TB
        JWT["JwtAuthGuard\nverifikasi Bearer token"]
        ROLE["RolesGuard\ncek @Roles('ADMIN')"]
        PUB["@Public()\nskip auth guard"]
    end

    subgraph PIPE["📋 Pipes (Validasi)"]
        direction TB
        VAL["ValidationPipe (global)\nclass-validator DTO"]
        TRANS["class-transformer\nTransformasi tipe data"]
    end

    subgraph CTRL["🎮 Controller"]
        direction TB
        DEC["@Get @Post @Put @Delete\n@Body @Param @Query @CurrentUser"]
        C["Terima request, delegasi ke Service"]
    end

    subgraph SVC["⚙️ Service (Business Logic)"]
        direction TB
        PS["PrismaService\n(database queries)"]
        RS["RedisService\n(caching)"]
        CL["CloudinaryService\n(upload gambar)"]
    end

    subgraph INTER["🔄 Interceptor (Response)"]
        RI["ResponseInterceptor\nbungkus data → { success, data }"]
    end

    ERR(["❌ HttpExceptionFilter\nformat error response"])
    RES(["📤 HTTP Response JSON"])

    REQ --> MW --> GUARD --> PIPE --> CTRL --> SVC --> INTER --> RES
    GUARD -->|"Token invalid / forbidden"| ERR
    PIPE -->|"DTO validation gagal"| ERR
    SVC -->|"Prisma / logic error"| ERR
    ERR --> RES
```

---

## 🔐 Strategi Autentikasi JWT

```mermaid
sequenceDiagram
    participant C as Client (Next.js)
    participant B as NestJS Backend
    participant DB as PostgreSQL (Prisma)
    participant R as Redis

    C->>B: POST /api/auth/login { email, password }
    B->>DB: prisma.user.findUnique({ where: { email } })
    DB-->>B: User record
    B->>B: bcrypt.compare(password, user.password)
    B->>B: jwtService.sign({ sub: userId, role }) → accessToken (15m)
    B->>B: jwtService.sign({ sub: userId }) → refreshToken (7d)
    B->>R: SET refresh:userId refreshToken EX 604800
    B-->>C: { accessToken } + Set-Cookie: refreshToken (httpOnly)

    Note over C: accessToken disimpan di memory/state
    Note over C: refreshToken di httpOnly Cookie

    C->>B: GET /api/recipes (Authorization: Bearer accessToken)
    B->>B: JwtAuthGuard → JwtStrategy.validate(payload)
    B-->>C: 200 OK { data: [...] }

    Note over C: accessToken expired setelah 15 menit
    C->>B: POST /api/auth/refresh (Cookie: refreshToken)
    B->>B: JwtRefreshGuard → JwtRefreshStrategy.validate()
    B->>R: GET refresh:userId → validasi match
    R-->>B: Valid
    B->>B: Buat accessToken baru
    B-->>C: { accessToken baru }
```

---

## 🔑 Alur Google OAuth (NestJS + Passport)

```mermaid
sequenceDiagram
    actor U as Pengguna
    participant FE as Next.js
    participant NE as NestJS Backend
    participant G as Google OAuth
    participant DB as PostgreSQL (Prisma)
    participant R as Redis

    U->>FE: Klik "Login dengan Google"
    FE->>NE: GET /api/auth/google
    NE->>NE: GoogleAuthGuard → passport.authenticate('google')
    NE->>G: Redirect ke Google Consent Screen
    G->>U: Tampilkan izin akses
    U->>G: Setujui
    G->>NE: GET /api/auth/google/callback?code=...
    NE->>G: Tukar code → profile { id, name, email, picture }
    G-->>NE: Google profile

    alt User sudah ada (googleId match)
        NE->>DB: prisma.user.findUnique({ where: { googleId } })
        DB-->>NE: User ditemukan
    else User baru
        NE->>DB: prisma.user.create({ googleId, name, email, avatar })
        DB-->>NE: User baru tersimpan
    end

    NE->>NE: jwtService.sign() → accessToken + refreshToken
    NE->>R: Simpan refreshToken (TTL 7 hari)
    NE->>FE: Redirect + Set-Cookie: refreshToken
    FE-->>U: Halaman profil terbuka ✅
```

---

## 🔄 Diagram Arsitektur Sistem Lengkap

```mermaid
graph TD
    subgraph FE["🖥️ Frontend — Next.js (Port 3000)"]
        Pages["App Router Pages\nSSR + ISR"]
        APIClient["fetch() / axios\nAPI Client"]
    end

    subgraph BE["⚙️ Backend — NestJS (Port 3000)"]
        subgraph Layer1["📥 Transport Layer"]
            CTRL["Controllers\n@Controller decorators"]
        end
        subgraph Layer2["🛡️ Cross-Cutting"]
            GU["Guards\nJwtAuthGuard · RolesGuard"]
            PI["Pipes\nValidationPipe (class-validator)"]
            IN["Interceptors\nResponseInterceptor · LoggingInterceptor"]
            FI["Filters\nHttpExceptionFilter"]
        end
        subgraph Layer3["⚙️ Business Logic"]
            SVC["Services\n@Injectable()"]
        end
        subgraph Layer4["💾 Data Access"]
            PRS["PrismaService\nextends PrismaClient"]
        end
    end

    subgraph DATA["💾 Data Layer"]
        PG[("PostgreSQL 16")]
        RD[("Redis")]
        CLD["☁️ Cloudinary"]
    end

    subgraph AUTH["🔐 Auth"]
        JWT["JWT Strategy\n(accessToken 15m)"]
        JWR["JWT Refresh Strategy\n(refreshToken 7d)"]
        GOO["Google OAuth Strategy"]
    end

    Pages --> APIClient
    APIClient -->|"REST API"| CTRL
    CTRL --> GU --> PI --> SVC
    IN --> CTRL
    SVC --> PRS
    PRS --> PG
    SVC --> RD
    SVC --> CLD
    GU --> JWT
    GU --> JWR
    GU --> GOO
```

---

## 📤 Alur Upload Gambar ke Cloudinary

```mermaid
sequenceDiagram
    actor U as Pengguna
    participant FE as Next.js
    participant NE as NestJS + Multer
    participant CL as Cloudinary API
    participant DB as PostgreSQL (Prisma)

    U->>FE: Pilih file gambar
    FE->>NE: POST /api/uploads/image\nContent-Type: multipart/form-data
    NE->>NE: FileInterceptor (Multer)\nvalidasi: jpg/png/webp, max 5MB

    alt File tidak valid
        NE-->>FE: 400 Bad Request { error }
    end

    NE->>CL: cloudinary.uploader.upload(buffer,\n{ folder: 'dapur-nusantara/recipes' })
    CL->>CL: Auto resize + compress + CDN
    CL-->>NE: { secure_url, public_id }
    NE-->>FE: { url: "https://res.cloudinary.com/..." }

    FE->>NE: POST /api/recipes\n{ ..., imageSrc: url, heroSrc: url }
    NE->>NE: ValidationPipe → CreateRecipeDto
    NE->>DB: prisma.recipe.create({ data: { ... } })
    DB-->>NE: Recipe record
    NE-->>FE: 201 Created { data: recipe }
```

---

## ⚡ Alur Caching Redis (Cache-Aside)

```mermaid
flowchart TD
    REQ(["📨 GET /api/recipes?category=sarapan"])

    RD[("Redis")]
    PG[("PostgreSQL via Prisma")]

    CHECK{"Ada di\nRedis cache?"}
    HIT["✅ Cache HIT\nAmbil dari Redis"]
    MISS["❌ Cache MISS"]
    QUERY["prisma.recipe.findMany({\n  where, include, orderBy\n})"]
    STORE["redisService.set(key, data, 300)\nTTL: 5 menit"]
    RES(["📤 Response JSON ke Client"])

    REQ --> CHECK
    CHECK -->|"Ya"| HIT
    CHECK -->|"Tidak"| MISS
    HIT --> RES
    MISS --> QUERY
    QUERY --> PG
    PG --> STORE
    STORE --> RD
    STORE --> RES

    subgraph INV["🔄 Cache Invalidation (di Service)"]
        direction LR
        I1["POST /recipes\n→ redisService.del('recipes:*')"]
        I2["PUT /recipes/:slug\n→ redisService.del('recipe:{slug}')"]
        I3["DELETE /recipes/:slug\n→ redisService.del('recipe:{slug}', 'recipes:*')"]
    end
```

---

## 🍳 Alur Lengkap: Pengguna Melihat & Menyimpan Resep

```mermaid
sequenceDiagram
    actor U as Pengguna
    participant FE as Next.js (SSR)
    participant NE as NestJS API
    participant RD as Redis
    participant PG as PostgreSQL (Prisma)

    U->>FE: Buka /recipe/ayam-goreng-crispy
    FE->>NE: GET /api/recipes/ayam-goreng-crispy
    NE->>NE: @Public() — skip JwtAuthGuard
    NE->>RD: GET recipe:ayam-goreng-crispy

    alt Cache HIT
        RD-->>NE: Data resep (JSON)
    else Cache MISS
        NE->>PG: prisma.recipe.findUnique({\n  where: { slug },\n  include: { ingredients, steps, reviews, categories }\n})
        PG-->>NE: Data lengkap
        NE->>RD: SET recipe:ayam-goreng-crispy (TTL 10m)
    end

    NE-->>FE: 200 OK ResponseInterceptor wraps data
    FE->>FE: Render SSR (title, meta, hero, bahan, langkah)
    FE-->>U: Halaman resep tampil

    U->>FE: Klik ❤️ Simpan Resep
    FE->>NE: POST /api/users/me/favorites/{recipeId}\nAuthorization: Bearer accessToken
    NE->>NE: JwtAuthGuard → JwtStrategy.validate(payload)
    NE->>PG: prisma.favorite.create({ userId, recipeId })
    NE->>PG: prisma.activity.create({ type: RECIPE_SAVED })
    NE->>RD: DEL favorites:{userId}
    NE-->>FE: 201 Created
    FE-->>U: Icon ❤️ merah — resep tersimpan ✅
```

---

## 🌿 Environment Variables

```bash
# .env.example

# Server
PORT=3000
NODE_ENV=development

# Database (Prisma)
DATABASE_URL="postgresql://user:password@localhost:5432/dapur_nusantara"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-min-32-chars"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_REFRESH_EXPIRES="7d"

# Google OAuth (Passport)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# CORS
ALLOWED_ORIGINS="http://localhost:3001,https://dapurnusantara.com"

# Frontend URL
FRONTEND_URL="http://localhost:3001"

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxxxxxxxxxxxxxxxxx"  # Sandbox key untuk development
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxxxxxxxxxxxxxxxxx"  # Untuk frontend Snap.js
MIDTRANS_IS_PRODUCTION=false                               # true di production
MIDTRANS_MERCHANT_ID="G123456789"
```

---

## 🚀 Cara Memulai Backend NestJS

### 1. Install NestJS CLI & Inisialisasi Proyek

```bash
# Install NestJS CLI global
npm install -g @nestjs/cli

# Buat proyek baru di luar folder frontend
cd "Website Resep Makanan"
nest new backend-resep

# Pilih: npm (package manager)
cd backend-resep
```

### 2. Install Dependencies

```bash
# Database & ORM
npm install prisma @prisma/client
npx prisma init

# Auth
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-google-oauth20
npm install bcryptjs
npm install -D @types/passport-jwt @types/passport-google-oauth20 @types/bcryptjs

# Validasi & Config
npm install class-validator class-transformer
npm install @nestjs/config joi

# Swagger (dokumentasi otomatis)
npm install @nestjs/swagger

# Cache & Redis
npm install @nestjs/cache-manager cache-manager ioredis

# Upload file
npm install @nestjs/platform-express multer cloudinary
npm install -D @types/multer

# Rate limiting
npm install @nestjs/throttler

# Utilitas
npm install slugify
```

### 3. Generate Modules dengan NestJS CLI

```bash
# Generate semua module sekaligus
nest g module prisma
nest g module redis
nest g module auth
nest g module recipes
nest g module categories
nest g module users
nest g module reviews
nest g module journals
nest g module newsletter
nest g module uploads
nest g module common

# Generate controller & service per module
nest g controller auth --no-spec
nest g service auth --no-spec
nest g controller recipes --no-spec
nest g service recipes --no-spec
# ... ulangi untuk setiap module
```

### 4. Setup Database

```bash
# Jalankan PostgreSQL lokal (Docker)
docker run --name dapur-pg \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=dapur_nusantara \
  -p 5432:5432 -d postgres

# Jalankan Redis lokal (Docker)
docker run --name dapur-redis \
  -p 6379:6379 -d redis

# Buat tabel dari schema Prisma
npx prisma migrate dev --name init

# Seed data awal
npx prisma db seed
```

### 5. Jalankan Development Server

```bash
npm run start:dev   # Watch mode (hot reload)
npm run start:debug # Debug mode
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
npm run build       # Compile ke dist/
npm run start:prod  # Jalankan production build
```

---

## 📊 Strategi Caching Redis

| Data | Cache Key | TTL | Invalidasi |
|---|---|---|---|
| List resep (filter) | `recipes:{hash-params}` | 5 menit | Saat POST/PUT/DELETE recipe |
| Detail resep | `recipe:{slug}` | 10 menit | Saat PUT/DELETE recipe |
| List kategori | `categories:all` | 1 jam | Saat POST/PUT/DELETE category |
| Favorit user | `favorites:{userId}` | 5 menit | Saat add/remove favorite |
| Refresh token | `refresh:{userId}` | 7 hari | Saat logout (blacklist) |
| Rate limit counter | `throttle:{ip}` | 1 menit | Auto-expire |

---

## 🔗 Integrasi dengan Frontend Next.js

### Langkah Migrasi Data Statis

1. **Seed database** dari `data/recipes.ts` dan `data/categories.ts` menggunakan `prisma/seed.ts`
2. **Buat API client** di frontend: `app/lib/api.ts`
3. **Ganti import statis** di setiap halaman:

```typescript
// SEBELUM (data statis)
import { RECIPES } from '@/data/recipes'
const recipe = RECIPES.find(r => r.id === id)

// SESUDAH (fetch ke NestJS API)
// app/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL // http://localhost:3000/api

export async function getRecipe(slug: string) {
  const res = await fetch(`${API_URL}/recipes/${slug}`, {
    next: { revalidate: 60 }  // ISR — revalidate tiap 60 detik
  })
  if (!res.ok) notFound()
  const json = await res.json()
  return json.data  // ResponseInterceptor wraps di { success, data }
}

export async function getRecipes(params?: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${API_URL}/recipes?${qs}`, {
    next: { revalidate: 60 }
  })
  return res.json()
}
```

### Halaman yang Perlu Diupdate

| Halaman Frontend | Sumber Data Lama | API NestJS Baru |
|---|---|---|
| `app/page.tsx` | `data/recipes.ts` | `GET /api/recipes?limit=5` |
| `app/recipe/[id]/page.tsx` | `getRecipeById(id)` | `GET /api/recipes/:slug` |
| `app/kategori/page.tsx` | `data/categories.ts` | `GET /api/categories` |
| `app/journal/page.tsx` | Hardcoded `SCHEDULE` | `GET /api/journals/week` |
| `app/profile/page.tsx` | Data statis | `GET /api/users/me` + `/favorites` |
| `app/kategori/NewsletterForm.tsx` | Form kosong | `POST /api/newsletter/subscribe` |

---

## 🧪 Rencana Pengujian

```mermaid
graph TD
    subgraph Unit["Unit Tests — Jest"]
        U1["auth.service.spec.ts\nhash password, sign JWT, validate"]
        U2["recipes.service.spec.ts\nCRUD, filter, cache"]
        U3["users.service.spec.ts\nfavorites toggle"]
        U4["journals.service.spec.ts\nshopping list generation"]
    end

    subgraph E2E["E2E Tests — Supertest"]
        E1["POST /api/auth/login → return JWT"]
        E2["GET /api/recipes → paginated data"]
        E3["POST /api/recipes (auth) → 201 Created"]
        E4["GET /api/journals/week (auth) → jadwal"]
        E5["POST /api/users/me/favorites/:id → 201"]
    end

    Unit --> E2E
```

---

## 🚀 Diagram Deployment

```mermaid
graph TD
    subgraph Dev["💻 Development (Lokal)"]
        FE_L["Next.js :3001"]
        BE_L["NestJS :3000"]
        PG_L[("PostgreSQL :5432")]
        RD_L[("Redis :6379")]
        FE_L <-->|"REST API"| BE_L
        BE_L --> PG_L
        BE_L --> RD_L
    end

    subgraph Prod["☁️ Production"]
        subgraph FE_HOST["Vercel"]
            FE_P["Next.js\ndapurnusantara.com"]
        end

        subgraph BE_HOST["Railway / Render"]
            BE_P["NestJS API\napi.dapurnusantara.com"]
        end

        subgraph DATA_HOST["Supabase / Neon"]
            PG_P[("PostgreSQL")]
        end

        subgraph CACHE_HOST["Upstash"]
            RD_P[("Redis Serverless")]
        end

        CDN["☁️ Cloudinary\nGambar CDN"]

        FE_P <-->|"HTTPS REST"| BE_P
        BE_P --> PG_P
        BE_P --> RD_P
        BE_P --> CDN
    end

    Dev -->|"git push → CI/CD"| Prod
```

---

## 📋 Urutan Pengerjaan (Prioritas)

- [ ] **1. Inisialisasi proyek** — `nest new backend-resep`, install semua dependency
- [ ] **2. PrismaModule** — `prisma.service.ts` extends PrismaClient, `@Global()`
- [ ] **3. Schema database** — buat `schema.prisma`, jalankan `prisma migrate dev`
- [ ] **4. Seed data** — migrate 5 resep & 8 kategori dari frontend ke DB
- [ ] **5. ConfigModule** — setup `@nestjs/config` + validasi Joi
- [ ] **6. AuthModule** — Register, Login, JWT Strategy, JwtAuthGuard, `@CurrentUser`
- [ ] **7. Google OAuth** — GoogleStrategy, GoogleAuthGuard, callback handler
- [ ] **8. RecipesModule** — CRUD + filter + pagination + cache Redis
- [ ] **9. CategoriesModule** — CRUD + resep per kategori
- [ ] **10. ReviewsModule** — rating & komentar per resep
- [ ] **11. UsersModule** — profil, favorit, aktivitas
- [ ] **12. JournalsModule** — perencana makan + shopping list
- [ ] **13. NewsletterModule** — subscribe/unsubscribe
- [ ] **14. UploadsModule** — Multer + Cloudinary (gambar + video)
- [ ] **15. TutorialsModule** — CRUD tutorial, `TutorialAccessGuard`, signed video URL
- [ ] **16. PaymentsModule** — `MidtransService`, create transaksi, verify webhook, grant akses
- [ ] **17. RedisModule** — cache-aside pattern, blacklist token
- [ ] **18. Swagger** — `@nestjs/swagger` dokumentasi API otomatis
- [ ] **19. Tests** — unit test & e2e test per module (termasuk payment flow)
- [ ] **20. Integrasi frontend** — ganti data statis + tambah halaman tutorial + payment UI

---

> [!IMPORTANT]
> **Folder backend harus di luar `frontend-resep/`**
> ```
> Website Resep Makanan/
> ├── frontend-resep/   ← Next.js :3001 (sudah ada)
> └── backend-resep/    ← NestJS :3000 (baru)
> ```
> Frontend menggunakan `NEXT_PUBLIC_API_URL=http://localhost:3000/api`

> [!TIP]
> **NestJS CLI sangat membantu** — gunakan `nest g module`, `nest g controller`, `nest g service` untuk scaffolding otomatis. Semua file langsung di-wire ke module yang sesuai.

> [!NOTE]
> **Swagger otomatis tersedia** di `/api/docs` setelah mengaktifkan `@nestjs/swagger` di `main.ts`. Semua endpoint dan DTO terdokumentasi dari decorator TypeScript — tidak perlu tulis YAML manual.
