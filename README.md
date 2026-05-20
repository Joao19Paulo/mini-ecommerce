# 👕 DRIP Store — Mini E-commerce de Camisas

Mini e-commerce fullstack com CRUD completo de **Produtos** e **Usuários**, autenticação JWT, paginação, filtros e busca.

---

## 🚀 Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + React Router v6 |
| Backend | Node.js + Express |
| Banco de dados | NeDB (embedded, sem instalação) |
| Autenticação | JWT + bcryptjs |
| Estilo | CSS customizado (Design System próprio) |

---

## 📁 Estrutura do Projeto

```
mini-ecommerce/
├── backend/
│   └── src/
│       ├── app.js              # Entry point Express
│       ├── database/db.js      # NeDB + seed inicial
│       ├── middleware/auth.js  # JWT middleware
│       └── routes/
│           ├── auth.js         # Login / Register / Me
│           ├── products.js     # CRUD Produtos
│           └── users.js        # CRUD Usuários
├── frontend/
│   └── src/
│       ├── App.jsx             # Router + Providers
│       ├── context/            # Auth + Toast contexts
│       ├── pages/              # Dashboard, Produtos, Admin
│       ├── services/api.js     # Axios + endpoints
│       └── styles/global.css   # Design system
├── data/                       # Banco NeDB (auto-criado)
└── README.md
```

---

## ⚙️ Como rodar localmente

### Pré-requisitos
- Node.js 18+
- npm

### 1. Instalar dependências

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Iniciar o backend

```bash
cd backend
node src/app.js
# Servidor em: http://localhost:3001
```

### 3. Iniciar o frontend

```bash
cd frontend
npm run dev
# App em: http://localhost:5173
```

---

## 🔑 Credenciais padrão

| Perfil | Email | Senha |
|---|---|---|
| Admin | admin@camisas.com | admin123 |

---

## 📡 API Endpoints

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Registro público |
| GET | /api/auth/me | Usuário atual (autenticado) |

### Produtos
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | /api/produtos | — | Listar (paginado, filtros) |
| GET | /api/produtos/:id | — | Detalhe |
| POST | /api/produtos | Admin | Criar |
| PUT | /api/produtos/:id | Admin | Editar |
| PATCH | /api/produtos/:id/toggle | Admin | Ativar/Desativar |
| DELETE | /api/produtos/:id | Admin | Excluir |
| GET | /api/produtos/categorias/lista | — | Listar categorias |

### Usuários
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | /api/usuarios | Admin | Listar (paginado, filtros) |
| GET | /api/usuarios/:id | Autenticado | Detalhe |
| POST | /api/usuarios | Admin | Criar |
| PUT | /api/usuarios/:id | Autenticado | Editar |
| PATCH | /api/usuarios/:id/toggle | Admin | Ativar/Desativar |
| DELETE | /api/usuarios/:id | Admin | Excluir |

---

## ✅ Funcionalidades implementadas

### Requisitos obrigatórios
- [x] CRUD completo de Produtos (criar, listar, editar, excluir, toggle ativo)
- [x] CRUD completo de Usuários (criar, listar, editar, excluir, toggle ativo)
- [x] Integração Frontend ↔ Backend via API REST
- [x] Persistência em banco de dados (NeDB)
- [x] Interface com cadastro, listagem, edição, exclusão
- [x] Campos mínimos: id, nome, descrição, preço, estoque, categoria, ativo

### Bônus implementados
- [x] Autenticação com JWT (login / register)
- [x] Autorização por perfil (admin / user)
- [x] Busca/filtro em produtos e usuários
- [x] Paginação em todas as listagens
- [x] Seed automático com 8 produtos e 5 categorias

---

## 🗂 Histórico de commits sugerido

```
git init
git add .
git commit -m "chore: estrutura inicial do projeto"

# Backend
git commit -m "feat(backend): configuração Express + NeDB"
git commit -m "feat(backend): autenticação JWT (login/register)"
git commit -m "feat(backend): CRUD de produtos com paginação e filtros"
git commit -m "feat(backend): CRUD de usuários com autorização por perfil"

# Frontend
git commit -m "feat(frontend): estrutura React + Vite + router"
git commit -m "feat(frontend): design system e layout com sidebar"
git commit -m "feat(frontend): página de login e registro"
git commit -m "feat(frontend): dashboard com estatísticas"
git commit -m "feat(frontend): catálogo de produtos com filtros"
git commit -m "feat(frontend): admin - CRUD de produtos"
git commit -m "feat(frontend): admin - CRUD de usuários"
git commit -m "chore: ajustes finais e README"
```
