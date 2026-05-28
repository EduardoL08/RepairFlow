using AutoMapper;
using Moq;
using Xunit;
using FluentAssertions;
using RepairFlow.API.DTOs.Cliente;
using RepairFlow.API.Mappings;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Interfaces;
using RepairFlow.API.Services.Implementations;

namespace RepairFlow.Tests.Services;

public class ClienteServiceTests
{
    private readonly IMapper _mapper;
    private readonly Mock<IClienteRepository> _repositoryMock;
    private readonly ClienteService _service;

    public ClienteServiceTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<AutoMapperProfile>());
        _mapper = config.CreateMapper();
        _repositoryMock = new Mock<IClienteRepository>();
        _service = new ClienteService(_repositoryMock.Object, _mapper);
    }

    // ─── Testes GetAllAsync ───────────────────────────────────────────
    
    [Fact]
    public async Task GetAllAsync_DeveRetornarListaDeClientes()
    {
        // Arrange
        var id1 = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        var id2 = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        var clientesFake = new List<Cliente>
        {
            new() { Id = id1, Nome = "João Silva", Email = "joao@email.com", Cpf = "123.456.789-10", Telefone = "(11) 99999-9999", Endereco = "Rua 1" },
            new() { Id = id2, Nome = "Maria Santos", Email = "maria@email.com", Cpf = "987.654.321-09", Telefone = "(11) 88888-8888", Endereco = "Rua 2" },
        };
        _repositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(clientesFake);

        // Act
        var resultado = await _service.GetAllAsync();

        // Assert
        resultado.Should().HaveCount(2);
        resultado.First().Nome.Should().Be("João Silva");
        _repositoryMock.Verify(r => r.GetAllAsync(), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_DeveRetornarListaVaziaQuandoNaoHaClientes()
    {
        // Arrange
        _repositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Cliente>());

        // Act
        var resultado = await _service.GetAllAsync();

        // Assert
        resultado.Should().BeEmpty();
    }

    // ─── Testes GetByIdAsync ──────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_DeveRetornarCliente_QuandoExiste()
    {
        // Arrange
        var clienteId = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        var clienteFake = new Cliente
        {
            Id = clienteId,
            Nome = "João Silva",
            Email = "joao@email.com",
            Cpf = "123.456.789-10",
            Telefone = "(11) 99999-9999",
            Endereco = "Rua 1"
        };
        _repositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<string>())).ReturnsAsync(clienteFake);

        // Act
        var resultado = await _service.GetByIdAsync("abc123");

        // Assert
        resultado.Should().NotBeNull();
        resultado.Nome.Should().Be("João Silva");
        resultado.Email.Should().Be("joao@email.com");
    }

    [Fact]
    public async Task GetByIdAsync_DeveLancarExcecao_QuandoNaoExiste()
    {
        // Arrange
        _repositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<string>())).ReturnsAsync((Cliente?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.GetByIdAsync("inexistente")
        );
    }

    // ─── Testes CreateAsync ───────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_DeveCriarCliente_QuandoDadosValidos()
    {
        // Arrange
        var dto = new ClienteRequestDto
        {
            Nome = "João Silva",
            Email = "joao@email.com",
            Cpf = "123.456.789-10",
            Telefone = "(11) 99999-9999",
            Endereco = "Rua 1"
        };

        _repositoryMock.Setup(r => r.CpfExisteAsync(It.IsAny<string>(), null)).ReturnsAsync(false);
        _repositoryMock.Setup(r => r.EmailExisteAsync(It.IsAny<string>(), null)).ReturnsAsync(false);
        _repositoryMock.Setup(r => r.CreateAsync(It.IsAny<Cliente>())).ReturnsAsync((Cliente c) => c);

        // Act
        var resultado = await _service.CreateAsync(dto);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Nome.Should().Be("João Silva");
        _repositoryMock.Verify(r => r.CreateAsync(It.IsAny<Cliente>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_DeveLancarExcecao_QuandoCpfJaExiste()
    {
        // Arrange
        var dto = new ClienteRequestDto
        {
            Nome = "João Silva",
            Email = "joao@email.com",
            Cpf = "123.456.789-10",
            Telefone = "(11) 99999-9999",
            Endereco = "Rua 1"
        };

        _repositoryMock.Setup(r => r.CpfExisteAsync(It.IsAny<string>(), null)).ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateAsync(dto)
        );
    }

    [Fact]
    public async Task CreateAsync_DeveLancarExcecao_QuandoEmailJaExiste()
    {
        // Arrange
        var dto = new ClienteRequestDto
        {
            Nome = "João Silva",
            Email = "joao@email.com",
            Cpf = "123.456.789-10",
            Telefone = "(11) 99999-9999",
            Endereco = "Rua 1"
        };

        _repositoryMock.Setup(r => r.CpfExisteAsync(It.IsAny<string>(), null)).ReturnsAsync(false);
        _repositoryMock.Setup(r => r.EmailExisteAsync(It.IsAny<string>(), null)).ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateAsync(dto)
        );
    }

    // ─── Testes DeleteAsync ────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_DeveDeletar_QuandoExiste()
    {
        // Arrange
        _repositoryMock.Setup(r => r.ExistsAsync(It.IsAny<string>())).ReturnsAsync(true);
        _repositoryMock.Setup(r => r.DeleteAsync(It.IsAny<string>())).Returns(Task.CompletedTask);

        // Act
        await _service.DeleteAsync("abc123");

        // Assert
        _repositoryMock.Verify(r => r.DeleteAsync(It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_DeveLancarExcecao_QuandoNaoExiste()
    {
        // Arrange
        _repositoryMock.Setup(r => r.ExistsAsync(It.IsAny<string>())).ReturnsAsync(false);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.DeleteAsync("inexistente")
        );
    }
}