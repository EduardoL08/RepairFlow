# 📐 Princípios SOLID — RepairFlow

Este documento descreve como cada um dos cinco princípios SOLID foi aplicado no projeto **RepairFlow**, com exemplos reais do código.

---

## S — Single Responsibility Principle (SRP)

> _"Uma classe deve ter apenas um motivo para mudar."_

### Como foi aplicado

Cada camada do projeto tem uma responsabilidade única e bem definida:

**Controllers** — só recebem a requisição HTTP e delegam ao service:

```csharp
// ClienteController.cs
[HttpPost]
public async Task<IActionResult> Create([FromBody] ClienteRequestDto dto)
{
    var cliente = await _service.CreateAsync(dto);
    return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
}
```

O controller não sabe nada sobre regras de negócio, validação ou banco de dados. Ele apenas recebe, delega e responde.

**Services** — só contêm regras de negócio:

```csharp
// ClienteService.cs
public async Task<ClienteResponseDto> CreateAsync(ClienteRequestDto dto)
{
    var cpfExiste = await _repository.CpfExisteAsync(dto.Cpf);
    if (cpfExiste)
        throw new InvalidOperationException("CPF já cadastrado.");
    // ...
}
```

O service não sabe como o dado chega (HTTP, fila, CLI) nem como é persistido.

**Repositories** — só fazem acesso ao banco:

```csharp
// ClienteRepository.cs
public async Task<bool> CpfExisteAsync(string cpf, string? excludeId = null)
{
    var filter = Builders<Cliente>.Filter.Eq(c => c.Cpf, cpf);
    // ...
}
```

**ServiceCollectionExtensions** — SRP no próprio `Program.cs`. Em vez de um `Program.cs` com 200 linhas, cada grupo de dependências tem seu próprio método de extensão:

```csharp
// SeviceCollectionExten.cs
public static IServiceCollection AddRepositories(this IServiceCollection services) { ... }
public static IServiceCollection AddServices(this IServiceCollection services) { ... }
public static IServiceCollection AddValidators(this IServiceCollection services) { ... }
public static IServiceCollection AddJwtAuthentication(...) { ... }
```

---

## O — Open/Closed Principle (OCP)

> _"Uma entidade deve estar aberta para extensão, mas fechada para modificação."_

### Como foi aplicado

**Repositório genérico** — a classe `MongoRepository<T>` implementa operações comuns (GetAll, GetById, Create, Update, Delete) de forma genérica. Para adicionar um novo recurso (ex: `Fornecedor`), basta criar `FornecedorRepository` herdando de `MongoRepository<Fornecedor>` sem modificar nada existente:

```csharp
// Base/mongoRepository.cs
public abstract class MongoRepository<T> : IRepository<T>
{
    protected readonly IMongoCollection<T> _collection;

    protected MongoRepository(IMongoDatabase database, string collectionName)
    {
        _collection = database.GetCollection<T>(collectionName);
    }

    public async Task<IEnumerable<T>> GetAllAsync()
        => await _collection.Find(_ => true).ToListAsync();

    public async Task<T?> GetByIdAsync(string id) { ... }
    public async Task<T> CreateAsync(T entity) { ... }
    // ...
}
```

**Validators** — adicionar um novo campo com validação não modifica os validators existentes, apenas cria uma nova regra no validator específico.

**Middleware de erros** — o `ErrorHandlingMiddleware` trata exceções de forma genérica. Para adicionar o tratamento de um novo tipo de exceção, basta adicionar um novo `catch` sem modificar o comportamento existente:

```csharp
// ErrorHandlingMiddleware.cs
catch (KeyNotFoundException ex)
    => await WriteResponse(context, 404, ex.Message);
catch (InvalidOperationException ex)
    => await WriteResponse(context, 409, ex.Message);
catch (UnauthorizedAccessException ex)
    => await WriteResponse(context, 401, ex.Message);
// Novo tipo: adiciona aqui sem alterar os anteriores
```

---

## L — Liskov Substitution Principle (LSP)

> _"Objetos de uma subclasse devem poder substituir objetos da superclasse sem quebrar o programa."_

### Como foi aplicado

Qualquer implementação concreta de `IRepository<T>` pode substituir a abstração sem quebrar o comportamento esperado:

```csharp
// IRepository.cs
public interface IRepository<T>
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(string id);
    Task<T> CreateAsync(T entity);
    Task<T> UpdateAsync(string id, T entity);
    Task DeleteAsync(string id);
    Task<bool> ExistsAsync(string id);
    Task<long> CountAsync();
}
```

`ClienteRepository`, `EquipamentoRepository`, `TecnicoRepository` e `OrdemServicoRepository` implementam esta interface. Qualquer `IClienteRepository` pode ser substituído por um mock nos testes sem quebrar nenhum comportamento — isso é exatamente o que os testes unitários fazem com **Moq**:

```csharp
// ClienteServiceTests.cs
var _repositoryMock = new Mock<IClienteRepository>();
var _service = new ClienteService(_repositoryMock.Object, _mapper);
// O mock substitui o repositório real sem quebrar o service
```

---

## I — Interface Segregation Principle (ISP)

> _"Uma classe não deve ser forçada a implementar interfaces que não usa."_

### Como foi aplicado

As interfaces de repositório são segregadas por entidade. Cada repository interface estende `IRepository<T>` com apenas os métodos que fazem sentido para aquela entidade:

```csharp
// IClienteRepository.cs — métodos específicos de Cliente
public interface IClienteRepository : IRepository<Cliente>
{
    Task<bool> CpfExisteAsync(string cpf, string? excludeId = null);
    Task<bool> EmailExisteAsync(string email, string? excludeId = null);
}

// IEquipamentoRepository.cs — métodos específicos de Equipamento
public interface IEquipamentoRepository : IRepository<Equipamento>
{
    Task<IEnumerable<Equipamento>> GetByClienteIdAsync(string clienteId);
    Task<bool> NumeroSerieExisteAsync(string numeroSerie, string? excludeId = null);
}

// ITecnicoRepository.cs — métodos específicos de Técnico
public interface ITecnicoRepository : IRepository<Tecnico>
{
    Task<bool> EmailExisteAsync(string email, string? excludeId = null);
}
```

Assim, `ClienteService` depende apenas de `IClienteRepository` e não é forçado a implementar métodos de equipamento ou técnico.

As interfaces de service também são segregadas:

```csharp
// IAuthService.cs — só autenticação
public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto);
}

// IOrdemServicoService.cs — só ordens
public interface IOrdemServicoService
{
    Task<IEnumerable<OrdemServicoResponseDto>> GetAllAsync();
    Task<OrdemServicoResponseDto> AtualizarStatusAsync(string id, OrdemServicoAtualizarStatusDto dto);
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    // ...
}
```

---

## D — Dependency Inversion Principle (DIP)

> _"Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações."_

### Como foi aplicado

Todo o projeto é construído sobre abstrações (interfaces), nunca sobre implementações concretas. A injeção de dependência do ASP.NET Core garante isso:

**Services dependem de interfaces de repositório:**

```csharp
// ClienteService.cs
public class ClienteService : IClienteService
{
    private readonly IClienteRepository _repository; // interface, não classe concreta
    private readonly IMapper _mapper;

    public ClienteService(IClienteRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }
}
```

**Controllers dependem de interfaces de service:**

```csharp
// ClienteController.cs
public class ClientesController : ControllerBase
{
    private readonly IClienteService _service; // interface, não classe concreta

    public ClientesController(IClienteService service)
    {
        _service = service;
    }
}
```

**Registro no container de DI (nunca new direto):**

```csharp
// SeviceCollectionExten.cs
services.AddScoped<IClienteRepository, ClienteRepository>();
services.AddScoped<IClienteService, ClienteService>();
```

O módulo `ClientesController` não sabe qual implementação de `IClienteService` está sendo usada. Em produção é `ClienteService`; em testes é um mock. **O código de alto nível não depende do código de baixo nível — ambos dependem da interface.**

---

## 📊 Resumo

| Princípio                     | Onde aplicado                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------- |
| **S** — Single Responsibility | Controllers, Services, Repositories, Extensions (DI), Validators, Middlewares    |
| **O** — Open/Closed           | `MongoRepository<T>` genérico, `ErrorHandlingMiddleware`, Validators             |
| **L** — Liskov Substitution   | `IRepository<T>` implementado por todos os repositories, mocks nos testes        |
| **I** — Interface Segregation | Interfaces separadas por entidade (IClienteRepository, ITecnicoRepository, etc.) |
| **D** — Dependency Inversion  | Toda a camada de DI via `IServiceCollection`, nenhum `new` direto entre camadas  |
