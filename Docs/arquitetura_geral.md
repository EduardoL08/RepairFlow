# 🏗 Arquitetura Geral — RepairFlow

Visão completa da arquitetura do sistema: containers, camadas internas da API, fluxo de dados e infraestrutura Docker.

---

## 1. Visão de Containers (Docker Compose)


```mermaid
graph TB
    subgraph HOST["💻 Máquina do Usuário"]
        Browser["🌐 Navegador\nhttp://localhost:80"]
        Swagger["📋 Swagger UI\nhttp://localhost:5000/swagger"]
        MongoUI["🗄 Mongo Express\nhttp://localhost:8081"]
    end

    subgraph DOCKER["🐳 Docker Compose — assistencia_net"]
        direction TB

        subgraph FE["assistencia_frontend"]
            NGINX["nginx:alpine\nServe HTML/CSS/JS\nProxy /api → backend:5000"]
        end

        subgraph BE["assistencia_backend"]
            DOTNET[".NET 10 Web API\nporta interna: 5000"]
        end

        subgraph DB["assistencia_mongo"]
            MONGO["MongoDB 7.0\nporta interna: 27017\nvolume: mongo_data"]
        end

        subgraph DBUI["assistencia_mongo_express"]
            EXPRESS["Mongo Express 1.0.2\nporta interna: 8081"]
        end
    end

    Browser -->|"porta 80"| NGINX
    Swagger -->|"porta 5000"| DOTNET
    MongoUI -->|"porta 8081"| EXPRESS

    NGINX -->|"http://backend:5000/api/*\n(rede interna)"| DOTNET
    DOTNET -->|"mongodb://admin:admin123\n@mongodb:27017"| MONGO
    EXPRESS -->|"mongodb://admin:admin123\n@mongodb:27017"| MONGO

    style HOST fill:#1e2333,stroke:#00d4ff,color:#f0f4ff
    style DOCKER fill:#0f1219,stroke:#3b82f6,color:#f0f4ff
    style FE fill:#181c27,stroke:#10d987,color:#f0f4ff
    style BE fill:#181c27,stroke:#f59e0b,color:#f0f4ff
    style DB fill:#181c27,stroke:#f97316,color:#f0f4ff
    style DBUI fill:#181c27,stroke:#a78bfa,color:#f0f4ff
```

---

## 2. Camadas Internas da API (.NET 10)


```mermaid
graph TD
    subgraph PIPELINE["Pipeline ASP.NET Core"]
        REQ["📥 HTTP Request"]
        CORS["CORS Middleware\nFrontendPolicy"]
        ERR["ErrorHandling\nMiddleware"]
        AUTH_MW["Authentication\nMiddleware JWT"]
        AUTHZ["Authorization\nMiddleware RBAC"]
        CTRL["Controllers\nClienteController\nEquipamentoController\nTecnicoController\nOrdemServicoController\nAuthController"]
    end

    subgraph VALIDATION["Validação"]
        FV["FluentValidation\nClienteValidator\nEquipamentoValidator\nTecnicoValidator\nOrdemServicoValidator\nAuthValidator"]
    end

    subgraph SERVICES["Camada de Serviços"]
        CS["ClienteService"]
        ES["EquipamentoService"]
        TS["TecnicoService"]
        OS["OrdemServicoService"]
        AS["AuthService"]
        TKS["TokenService\nJWT Generator"]
    end

    subgraph MAPPING["AutoMapper"]
        AM["AutoMapperProfile\nDTO ↔ Model"]
    end

    subgraph REPOS["Camada de Repositórios"]
        BASE["MongoRepository&lt;T&gt;\nBase Genérica"]
        CR["ClienteRepository"]
        ER["EquipamentoRepository"]
        TR["TecnicoRepository"]
        OR["OrdemServicoRepository"]
        UR["UsuarioRepository"]
    end

    subgraph DATA["Banco de Dados"]
        MDB["MongoDB 7.0\nRepairFlow Database"]
        C1["clientes"]
        C2["equipamentos"]
        C3["tecnicos"]
        C4["ordensservico"]
        C5["usuarios"]
    end

    REQ --> CORS --> ERR --> AUTH_MW --> AUTHZ --> CTRL
    CTRL --> FV
    CTRL --> SERVICES
    SERVICES --> AM
    SERVICES --> REPOS
    BASE --> CR & ER & TR & OR & UR
    CR --> C1
    ER --> C2
    TR --> C3
    OR --> C4
    UR --> C5
    C1 & C2 & C3 & C4 & C5 --> MDB

    style PIPELINE fill:#0f1219,stroke:#00d4ff,color:#f0f4ff
    style VALIDATION fill:#0f1219,stroke:#f59e0b,color:#f0f4ff
    style SERVICES fill:#0f1219,stroke:#10d987,color:#f0f4ff
    style MAPPING fill:#0f1219,stroke:#a78bfa,color:#f0f4ff
    style REPOS fill:#0f1219,stroke:#f97316,color:#f0f4ff
    style DATA fill:#0f1219,stroke:#3b82f6,color:#f0f4ff
```

---

## 3. Arquitetura do Frontend

```mermaid
graph TD
    subgraph HTML["index.html"]
        ROUTER["Router\n(hash-based)\napp.js"]
    end

    subgraph PAGES["Páginas (js/pages/)"]
        PD["dashboard.js"]
        PC["clientes.js"]
        PE["equipamentos.js"]
        PT["tecnicos.js"]
        PO["ordens.js"]
    end

    subgraph CORE["Core (js/)"]
        STORE["store.js\nlocalStorage\n(token + user)"]
        API["api.js\nHTTP Client\nfetch + JWT header"]
        UI["ui.js\nToast / Modal\nbadges / helpers"]
        ICONS["icons.js\nSVG Library\nLucide-style"]
        AUTH["auth.js\nlogin / logout"]
        CONFIG["config.js\nConstantes"]
    end

    subgraph CSS["Estilos (css/)"]
        VAR["variables.css\nDark Theme Tokens"]
        COMP["components.css\nInputs / Botões / Badges"]
        LAY["layout.css\nSidebar / Tabelas"]
        MOD["modal.css"]
        LOG["login.css"]
        DASH["dashboard.css"]
    end

    subgraph BACKEND_REF["API Backend"]
        BE_API["http://backend:5000/api\n(via nginx proxy)"]
    end

    ROUTER --> PD & PC & PE & PT & PO
    PAGES --> API
    PAGES --> UI
    PAGES --> ICONS
    AUTH --> STORE
    AUTH --> API
    API --> STORE
    API --> BE_API
    ROUTER --> AUTH
    ROUTER --> STORE

    style HTML fill:#0f1219,stroke:#00d4ff,color:#f0f4ff
    style PAGES fill:#0f1219,stroke:#10d987,color:#f0f4ff
    style CORE fill:#0f1219,stroke:#f59e0b,color:#f0f4ff
    style CSS fill:#0f1219,stroke:#a78bfa,color:#f0f4ff
    style BACKEND_REF fill:#0f1219,stroke:#3b82f6,color:#f0f4ff
```

---

## 4. Padrão de Injeção de Dependências

```mermaid
graph LR
    subgraph INTERFACES["Interfaces (abstrações)"]
        IR["IRepository&lt;T&gt;"]
        ICR["IClienteRepository"]
        ICS["IClienteService"]
        IAS["IAuthService"]
    end

    subgraph CONCRETAS["Implementações concretas"]
        MR["MongoRepository&lt;T&gt;"]
        CR["ClienteRepository"]
        CS["ClienteService"]
        AS["AuthService"]
    end

    subgraph DI["Container DI (ServiceCollectionExtensions)"]
        REG["AddRepositories()\nAddServices()\nAddValidators()\nAddJwtAuthentication()"]
    end

    subgraph CONSUMERS["Consumidores"]
        CTRL["ClientesController\ndepende de IClienteService"]
        SVC["ClienteService\ndepende de IClienteRepository"]
    end

    IR --> ICR
    MR --> CR
    ICR --> CR
    ICS --> CS
    IAS --> AS

    REG -->|"Scoped"| CR
    REG -->|"Scoped"| CS
    REG -->|"Scoped"| AS

    CTRL -->|"injeta"| ICS
    SVC -->|"injeta"| ICR

    style INTERFACES fill:#0f1219,stroke:#00d4ff,color:#f0f4ff
    style CONCRETAS fill:#0f1219,stroke:#10d987,color:#f0f4ff
    style DI fill:#0f1219,stroke:#f59e0b,color:#f0f4ff
    style CONSUMERS fill:#0f1219,stroke:#f97316,color:#f0f4ff
```
