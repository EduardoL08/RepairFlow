# 🔄 Fluxos do Sistema — RepairFlow

Diagramas de sequência e fluxo para os principais processos do sistema.

---

## 1. Fluxo de Autenticação JWT

```mermaid
sequenceDiagram
    actor U as Usuário
    participant FE as Frontend (nginx)
    participant MW as Middleware Pipeline
    participant AC as AuthController
    participant AS as AuthService
    participant TS as TokenService
    participant DB as MongoDB

    U->>FE: POST /api/auth/login<br/>{email, senha}
    FE->>MW: Repassa requisição
    MW->>MW: CORS check ✅
    MW->>MW: FluentValidation<br/>(email formato, senha obrigatória)
    alt Validação falhou
        MW-->>FE: 400 Bad Request<br/>{errors}
        FE-->>U: Toast ❌ "Dados inválidos"
    end
    MW->>AC: Login(dto)
    AC->>AS: LoginAsync(dto)
    AS->>DB: GetByEmailAsync(email)
    alt Usuário não encontrado
        DB-->>AS: null
        AS-->>AC: throw UnauthorizedAccessException
        AC-->>FE: 401 Unauthorized
        FE-->>U: Toast ❌ "E-mail ou senha inválidos"
    end
    DB-->>AS: Usuario { senhaHash, role, ... }
    AS->>AS: BCrypt.Verify(senha, senhaHash)
    alt Senha inválida
        AS-->>AC: throw UnauthorizedAccessException
        AC-->>FE: 401 Unauthorized
        FE-->>U: Toast ❌ "E-mail ou senha inválidos"
    end
    AS->>TS: GerarToken(usuario)
    TS->>TS: Cria JWT com claims:<br/>NameIdentifier, Name,<br/>Email, Role, Exp(+8h)
    TS-->>AS: token (JWT string)
    AS-->>AC: AuthResponseDto<br/>{token, nome, email, role, expiracao}
    AC-->>FE: 200 OK + AuthResponseDto
    FE->>FE: store.js: localStorage<br/>rf_token = token<br/>rf_user = {nome, email, role}
    FE-->>U: Toast ✅ "Bem-vindo, {nome}!"<br/>Redireciona → /dashboard
```

---

## 2. Fluxo de Requisição Autenticada (RBAC)

```mermaid
sequenceDiagram
    actor U as Usuário Logado
    participant FE as Frontend
    participant NX as nginx (proxy)
    participant MW as Middleware JWT
    participant RBAC as [Authorize] RBAC
    participant CTRL as Controller
    participant SVC as Service
    participant DB as MongoDB

    U->>FE: Clica em "Novo Técnico"<br/>(role = usuario)
    FE->>FE: api.js injeta header:<br/>Authorization: Bearer {token}
    FE->>NX: POST /api/tecnicos
    NX->>MW: Repassa para backend:5000
    MW->>MW: Extrai token do header
    MW->>MW: Valida assinatura HMAC-SHA256
    MW->>MW: Verifica expiração
    alt Token expirado ou inválido
        MW-->>FE: 401 Unauthorized
        FE->>FE: store.js: logout()<br/>limpa localStorage
        FE-->>U: Redireciona → /login
    end
    MW->>RBAC: ClaimsPrincipal com role=usuario
    RBAC->>RBAC: [Authorize(Roles = "admin")]<br/>role "usuario" ≠ "admin"
    RBAC-->>FE: 403 Forbidden
    FE-->>U: Toast ❌ "Acesso negado"

    Note over U,DB: Mesmo fluxo com role=admin → 201 Created
```

---

## 3. Fluxo Completo — Criação de Ordem de Serviço

```mermaid
flowchart TD
    A([Usuário abre\n'Nova Ordem']) --> B[Carrega listas:\nEquipamentos + Técnicos]
    B --> C{API retornou\ndados?}
    C -->|Não| D[Toast ❌ Erro ao carregar]
    C -->|Sim| E[Exibe modal\ncom formulários]

    E --> F[Usuário preenche:\n- Equipamento\n- Técnico\n- Problema\n- Valor\n- Prioridade]

    F --> G[Clica 'Criar']

    G --> H{Validação\nfrontend}
    H -->|Falhou| I[Toast ❌ Mensagem\nde erro inline]
    I --> F

    H -->|OK| J[POST /api/ordensservico\nc/ token JWT]

    J --> K{FluentValidation\nbackend}
    K -->|Falhou| L[400 Bad Request\n+ erros]
    L --> I

    K -->|OK| M{Equipamento\nexiste?}
    M -->|Não| N[404 Not Found]
    N --> I

    M -->|Sim| O{Técnico\nexiste?}
    O -->|Não| P[404 Not Found]
    P --> I

    O -->|Sim| Q[Cria OrdemServico\nstatus = Aberta\ndataAbertura = UtcNow]

    Q --> R[(MongoDB\nordensservico)]

    R --> S[201 Created\n+ OrdemServicoResponseDto]

    S --> T[Fecha modal]
    T --> U[Toast ✅ 'Ordem criada!']
    U --> V[Recarrega lista\nde ordens]

    style A fill:#0f1219,stroke:#00d4ff,color:#f0f4ff
    style D fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
    style I fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
    style L fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
    style N fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
    style P fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
    style S fill:#0f1219,stroke:#10d987,color:#f0f4ff
    style U fill:#0f1219,stroke:#10d987,color:#f0f4ff
    style R fill:#0f1219,stroke:#f59e0b,color:#f0f4ff
```

---

## 4. Ciclo de Vida de uma Ordem de Serviço

```mermaid
stateDiagram-v2
    [*] --> Aberta : POST /ordensservico\n(criação)

    Aberta --> EmAndamento : PATCH /status\n{status: "EmAndamento"}
    Aberta --> AguardandoPeca : PATCH /status\n{status: "AguardandoPeca"}
    Aberta --> Finalizada : PATCH /status\n{status: "Finalizada"}

    EmAndamento --> AguardandoPeca : PATCH /status\n{status: "AguardandoPeca"}
    EmAndamento --> Finalizada : PATCH /status\n{status: "Finalizada"\ndefine dataConclusao = UtcNow}

    AguardandoPeca --> EmAndamento : PATCH /status\n{status: "EmAndamento"}
    AguardandoPeca --> Finalizada : PATCH /status\n{status: "Finalizada"\ndefine dataConclusao = UtcNow}

    Finalizada --> [*] : Status final\n(dataConclusao preenchida)

    note right of Aberta
        dataAbertura = UtcNow
        dataConclusao = null
    end note

    note right of Finalizada
        dataConclusao = UtcNow
        Pode incluir diagnóstico,
        solução e valor final
    end note
```

---

## 5. Fluxo do Tratamento de Erros (Middleware)

```mermaid
flowchart LR
    REQ["📥 Request"] --> NEXT["_next(context)\nExecuta pipeline"]

    NEXT -->|"Sucesso"| RES["📤 Response 2xx"]

    NEXT -->|"Exception"| ERR{"Tipo da\nExceção"}

    ERR -->|"KeyNotFoundException"| R404["404 Not Found\n'X não encontrado'"]
    ERR -->|"InvalidOperationException"| R409["409 Conflict\n'CPF já cadastrado'"]
    ERR -->|"UnauthorizedAccessException"| R401["401 Unauthorized\n'Credenciais inválidas'"]
    ERR -->|"ArgumentException"| R400["400 Bad Request\n'Dados inválidos'"]
    ERR -->|"Exception (outros)"| R500["500 Internal Server Error\n'Erro interno'"]

    R404 & R409 & R401 & R400 & R500 --> RESP["JSON Response\n{\n  statusCode,\n  message,\n  timestamp\n}"]

    style REQ fill:#0f1219,stroke:#00d4ff,color:#f0f4ff
    style RES fill:#0f1219,stroke:#10d987,color:#f0f4ff
    style ERR fill:#0f1219,stroke:#f59e0b,color:#f0f4ff
    style R404 fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
    style R409 fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
    style R401 fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
    style R400 fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
    style R500 fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
    style RESP fill:#0f1219,stroke:#a78bfa,color:#f0f4ff
```

---

## 6. Fluxo de Navegação do Frontend (SPA)

```mermaid
flowchart TD
    START(["Abre\nhttp://localhost"]) --> CHECK{"localStorage\nrf_token existe?"}

    CHECK -->|"Não"| LOGIN["Exibe\ntela de Login"]
    CHECK -->|"Sim"| APP["Exibe App\nRenderiza Sidebar"]

    LOGIN --> FORM["Usuário preenche\ne-mail + senha"]
    FORM --> POST["POST /api/auth/login"]
    POST -->|"401"| LOGINERR["Exibe erro\nno formulário"]
    LOGINERR --> FORM
    POST -->|"200"| SAVE["Salva token\nno localStorage"]
    SAVE --> APP

    APP --> HASH{"Hash da URL\n#dashboard\n#clientes\n#tecnicos..."}

    HASH -->|"#dashboard"| PD["PageDashboard.render()\nGET /ordensservico/dashboard\nGET /ordensservico"]
    HASH -->|"#clientes"| PC["PageClientes.render()\nGET /clientes"]
    HASH -->|"#equipamentos"| PE["PageEquipamentos.render()\nGET /equipamentos\nGET /clientes"]
    HASH -->|"#tecnicos"| PT["PageTecnicos.render()\nGET /tecnicos"]
    HASH -->|"#ordens"| PO["PageOrdens.render()\nGET /ordensservico\nGET /equipamentos\nGET /tecnicos"]

    PD & PC & PE & PT & PO -->|"401 em qualquer chamada"| LOGOUT["Auth.logout()\nLimpa localStorage\nRedireciona → /login"]

    style START fill:#0f1219,stroke:#00d4ff,color:#f0f4ff
    style LOGIN fill:#0f1219,stroke:#f59e0b,color:#f0f4ff
    style APP fill:#0f1219,stroke:#10d987,color:#f0f4ff
    style LOGOUT fill:#0f1219,stroke:#f43f5e,color:#f0f4ff
```
