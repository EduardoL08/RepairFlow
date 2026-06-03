<div align="center">

# ⚡ RepairFlow

### Sistema de Assistência Técnica de Eletrônicos

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)
[![xUnit](https://img.shields.io/badge/Tests-xUnit-512BD4?style=flat-square)](https://xunit.net/)

Projeto acadêmico semestral — API REST full-stack para gerenciamento de ordens de serviço de assistência técnica de eletrônicos, com autenticação JWT, controle de acesso por roles (RBAC) e interface web moderna.

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Executar](#-como-executar)
- [Endpoints da API](#-endpoints-da-api)
- [Autenticação e RBAC](#-autenticação-e-rbac)
- [Testes](#-testes)
- [Histórico de Commits](#-histórico-de-commits)
- [Princípios SOLID](#-princípios-solid)

---

## 💡 Sobre o Projeto

O **RepairFlow** é um sistema completo para gerenciamento de assistência técnica de eletrônicos. Permite controlar:

- **Clientes** cadastrados no sistema
- **Equipamentos** vinculados a clientes
- **Técnicos** com especialidades definidas
- **Ordens de Serviço** com status e prioridade, do diagnóstico à conclusão

O projeto foi desenvolvido de forma gradual, simulando um fluxo real de desenvolvimento com commits incrementais, princípios SOLID, testes unitários e containerização completa via Docker.

---

## 🛠 Tecnologias

### Backend

| Tecnologia                | Versão  | Uso                             |
| ------------------------- | ------- | ------------------------------- |
| **.NET**                  | 10.0    | Framework principal da API REST |
| **MongoDB.Driver**        | 2.29.0  | Driver oficial do MongoDB       |
| **JWT Bearer**            | 10.0.0  | Autenticação via tokens JWT     |
| **AutoMapper**            | 13.0.1  | Mapeamento entre DTOs e Models  |
| **FluentValidation**      | 11.3.0  | Validação de dados de entrada   |
| **Swashbuckle (Swagger)** | 6.9.0   | Documentação interativa da API  |
| **BCrypt.Net-Next**       | 4.0.3   | Hash seguro de senhas           |
| **xUnit**                 | 2.9.2   | Framework de testes unitários   |
| **Moq**                   | 4.20.72 | Mock de dependências nos testes |
| **FluentAssertions**      | 6.12.1  | Assertivas legíveis nos testes  |

### Frontend

| Tecnologia                    | Uso                                                   |
| ----------------------------- | ----------------------------------------------------- |
| **HTML5 / CSS3**              | Estrutura e estilos da interface                      |
| **JavaScript (ES6+)**         | Lógica da SPA (Single Page Application)               |
| **nginx**                     | Servidor HTTP para arquivos estáticos + proxy reverso |
| **Lucide Icons (SVG inline)** | Ícones modernos sem dependência externa               |

### Infraestrutura

| Tecnologia         | Versão | Uso                          |
| ------------------ | ------ | ---------------------------- |
| **Docker**         | —      | Containerização dos serviços |
| **Docker Compose** | —      | Orquestração dos containers  |
| **MongoDB**        | 7.0    | Banco de dados NoSQL         |
| **Mongo Express**  | 1.0.2  | Interface visual do banco    |

---

## 🏗 Arquitetura

O projeto segue a arquitetura em **camadas** com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (nginx)                     │
│              HTML + CSS + JavaScript                    │
│                  porta 80                               │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP /api/*
┌──────────────────────▼──────────────────────────────────┐
│                  BACKEND (.NET 10)                      │
│                                                         │
│  Controllers → Services → Repositories → MongoDB       │
│                                                         │
│  • JWT Authentication (Bearer)                          │
│  • RBAC (admin / usuario)                               │
│  • FluentValidation                                     │
│  • AutoMapper                                           │
│  • ErrorHandling Middleware                             │
│                  porta 5000                             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  MONGODB 7.0                            │
│              banco: RepairFlow                          │
│                  porta 27017                            │
└─────────────────────────────────────────────────────────┘
```

### Padrões utilizados

- **Repository Pattern** — abstrai o acesso ao banco de dados
- **Service Layer** — contém regras de negócio
- **DTO Pattern** — separa modelos de entrada/saída do domínio
- **Dependency Injection** — injeção via `IServiceCollection`
- **Middleware Pipeline** — tratamento centralizado de erros

---

## 📁 Estrutura de Pastas

```
RepairFlow/
├── docker-compose.yml
├── README.md
├── SOLID.md
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── RepairFlow.sln
│   │
│   ├── RepairFlow.API/
│   │   ├── Configurations/        # JwtSettings, MongoDbSettings, SwaggerConfig
│   │   ├── Controllers/           # AuthController, ClienteController, etc.
│   │   ├── DTOs/                  # Objetos de transferência de dados
│   │   ├── Extensions/            # ServiceCollectionExtensions (DI)
│   │   ├── Mappings/              # AutoMapperProfile
│   │   ├── Middlewares/           # ErrorHandlingMiddleware
│   │   ├── Models/                # Entidades do domínio
│   │   ├── Repositories/
│   │   │   ├── Base/              # MongoRepository<T> genérico
│   │   │   ├── Interfaces/        # IRepository<T>, IClienteRepository, etc.
│   │   │   └── Implementations/   # Implementações concretas
│   │   ├── Services/
│   │   │   ├── Interfaces/        # IClienteService, IAuthService, etc.
│   │   │   └── Implementations/   # Implementações concretas
│   │   ├── Validators/            # ClienteValidator, TecnicoValidator, etc.
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── appsettings.Development.json
│   │
│   └── RepairFlow.Tests/
│       ├── Services/              # ClienteServiceTests, OrdemServicoServiceTests
│       └── Validators/            # ValidatorTests
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    ├── css/
    │   ├── variables.css          # Tokens de design (dark theme)
    │   ├── components.css         # Inputs, botões, badges, toasts
    │   ├── layout.css             # Sidebar, tabelas, page header
    │   ├── modal.css              # Modais
    │   ├── login.css              # Tela de login
    │   └── dashboard.css          # Stats cards, barras de progresso
    └── js/
        ├── config.js              # Constantes e configurações
        ├── store.js               # Estado global (localStorage)
        ├── api.js                 # Cliente HTTP + todos os endpoints
        ├── icons.js               # Biblioteca SVG inline (Lucide-style)
        ├── ui.js                  # Helpers: Toast, Modal, badges
        ├── auth.js                # Login, logout
        ├── app.js                 # Roteador e inicialização
        └── pages/
            ├── dashboard.js       # Dashboard com estatísticas
            ├── clientes.js        # CRUD de clientes
            ├── equipamentos.js    # CRUD de equipamentos
            ├── tecnicos.js        # CRUD de técnicos
            └── ordens.js          # CRUD de ordens de serviço
```

---

## 🚀 Como Executar

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd RepairFlow
```

### 2. Subir todos os serviços

```bash
docker compose up -d
```

> Na primeira execução, o Docker irá baixar as imagens e compilar o backend/frontend. Aguarde alguns minutos.

### 3. Verificar se está rodando

```bash
docker compose ps
```

Saída esperada:

```
NAME                     STATUS
assistencia_mongo        Up (healthy)
assistencia_mongo_express Up
assistencia_backend      Up
assistencia_frontend     Up
```

### 4. Acessar os serviços

| Serviço           | URL                           | Credenciais                     |
| ----------------- | ----------------------------- | ------------------------------- |
| **Frontend**      | http://localhost              | admin@repairflow.com / Admin123 |
| **Swagger (API)** | http://localhost:5000/swagger | —                               |
| **Mongo Express** | http://localhost:8081         | admin / admin123                |

### Comandos úteis

```bash
# Parar tudo
docker compose down

# Ver logs em tempo real
docker compose logs -f

# Rebuildar após alterações no código
docker compose up -d --build

# Rebuildar só o frontend
docker compose up -d --build frontend
```

---

## 📡 Endpoints da API

### Auth

| Método | Rota                 | Descrição              | Auth |
| ------ | -------------------- | ---------------------- | ---- |
| POST   | `/api/auth/login`    | Autenticar usuário     | ❌   |
| POST   | `/api/auth/register` | Registrar novo usuário | ❌   |

### Clientes

| Método | Rota                 | Descrição     | Role          |
| ------ | -------------------- | ------------- | ------------- |
| GET    | `/api/clientes`      | Listar todos  | usuario/admin |
| GET    | `/api/clientes/{id}` | Buscar por ID | usuario/admin |
| POST   | `/api/clientes`      | Criar novo    | usuario/admin |
| PUT    | `/api/clientes/{id}` | Atualizar     | usuario/admin |
| DELETE | `/api/clientes/{id}` | Remover       | **admin**     |

### Equipamentos

| Método | Rota                                    | Descrição     | Role          |
| ------ | --------------------------------------- | ------------- | ------------- |
| GET    | `/api/equipamentos`                     | Listar todos  | usuario/admin |
| GET    | `/api/equipamentos/{id}`                | Buscar por ID | usuario/admin |
| GET    | `/api/equipamentos/cliente/{clienteId}` | Por cliente   | usuario/admin |
| POST   | `/api/equipamentos`                     | Criar novo    | usuario/admin |
| PUT    | `/api/equipamentos/{id}`                | Atualizar     | usuario/admin |
| DELETE | `/api/equipamentos/{id}`                | Remover       | **admin**     |

### Técnicos

| Método | Rota                 | Descrição     | Role          |
| ------ | -------------------- | ------------- | ------------- |
| GET    | `/api/tecnicos`      | Listar todos  | usuario/admin |
| GET    | `/api/tecnicos/{id}` | Buscar por ID | usuario/admin |
| POST   | `/api/tecnicos`      | Criar novo    | **admin**     |
| PUT    | `/api/tecnicos/{id}` | Atualizar     | **admin**     |
| DELETE | `/api/tecnicos/{id}` | Remover       | **admin**     |

### Ordens de Serviço

| Método | Rota                             | Descrição                | Role          |
| ------ | -------------------------------- | ------------------------ | ------------- |
| GET    | `/api/ordensservico`             | Listar (filtro ?status=) | usuario/admin |
| GET    | `/api/ordensservico/dashboard`   | Estatísticas             | usuario/admin |
| GET    | `/api/ordensservico/{id}`        | Buscar por ID            | usuario/admin |
| POST   | `/api/ordensservico`             | Criar nova               | usuario/admin |
| PUT    | `/api/ordensservico/{id}`        | Atualizar                | usuario/admin |
| PATCH  | `/api/ordensservico/{id}/status` | Atualizar status         | usuario/admin |
| DELETE | `/api/ordensservico/{id}`        | Remover                  | **admin**     |

---

## 🔐 Autenticação e RBAC

O sistema utiliza **JWT (JSON Web Token)** para autenticação stateless.

### Fluxo de autenticação

```
1. POST /api/auth/login  →  { email, senha }
2. Resposta: { token, nome, email, role, expiracao }
3. Todas as requisições seguintes: Authorization: Bearer {token}
```

### Roles disponíveis

| Role      | Permissões                                               |
| --------- | -------------------------------------------------------- |
| `usuario` | GET em tudo, POST/PUT em clientes, equipamentos e ordens |
| `admin`   | Tudo, incluindo DELETE e gestão de técnicos              |

### Configuração JWT (appsettings.json)

```json
{
  "JwtSettings": {
    "SecretKey": "REPAIRFLOW_SECRET_KEY_CHANGE_IN_PRODUCTION_MIN_32",
    "Issuer": "RepairFlow.API",
    "Audience": "RepairFlow.Client",
    "ExpirationHours": 8
  }
}
```

---

## 🧪 Testes

O projeto contém **19 testes unitários** usando **xUnit + Moq + FluentAssertions**.

### Executar os testes

```bash
cd backend
dotnet test --verbosity normal
```

### Cobertura de testes

| Classe                     | Testes | O que cobre                                              |
| -------------------------- | ------ | -------------------------------------------------------- |
| `ClienteServiceTests`      | 9      | GetAll, GetById, Create (CPF/email duplicado), Delete    |
| `OrdemServicoServiceTests` | 4      | Create, AtualizarStatus (finalizar), GetById             |
| `ClienteValidatorTests`    | 4      | Nome vazio, CPF inválido, E-mail inválido, dados válidos |
| `RegisterValidatorTests`   | 3      | Senha forte, sem maiúscula, muito curta                  |

### Padrão AAA utilizado nos testes

```csharp
[Fact]
public async Task CreateAsync_DeveCriarCliente_QuandoDadosValidos()
{
    // Arrange — monta o cenário com dados fake
    _repositoryMock.Setup(r => r.CreateAsync(...)).ReturnsAsync(...);

    // Act — executa a ação testada
    var resultado = await _service.CreateAsync(dto);

    // Assert — verifica o resultado
    resultado.Should().NotBeNull();
    resultado.Nome.Should().Be("João Silva");
}

---

## 📐 Princípios SOLID

Veja o arquivo [SOLID.md](./SOLID.md) para a análise detalhada de como cada princípio SOLID foi aplicado no projeto.

---

## 👤 Autor

Desenvolvido como projeto semestral da disciplina de Desenvolvimento Full Stack.

---

<div align="center">
  <sub>RepairFlow © 2026 — Assistência Técnica de Eletrônicos</sub>
</div>
```
