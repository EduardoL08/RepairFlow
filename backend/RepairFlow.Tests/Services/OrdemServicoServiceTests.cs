using AutoMapper;
using Moq;
using Xunit;
using FluentAssertions;
using RepairFlow.API.DTOs.OrdemServico;
using RepairFlow.API.Mappings;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Interfaces;
using RepairFlow.API.Services.Implementations;

namespace RepairFlow.Tests.Services;

public class OrdemServicoServiceTests
{
    private readonly IMapper _mapper;
    private readonly Mock<IOrdemServicoRepository> _ordemRepoMock;
    private readonly Mock<IEquipamentoRepository> _equipamentoRepoMock;
    private readonly Mock<ITecnicoRepository> _tecnicoRepoMock;
    private readonly Mock<IClienteRepository> _clienteRepoMock;
    private readonly OrdemServicoService _service;

    public OrdemServicoServiceTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<AutoMapperProfile>());
        _mapper = config.CreateMapper();
        _ordemRepoMock = new Mock<IOrdemServicoRepository>();
        _equipamentoRepoMock = new Mock<IEquipamentoRepository>();
        _tecnicoRepoMock = new Mock<ITecnicoRepository>();
        _clienteRepoMock = new Mock<IClienteRepository>();

        _service = new OrdemServicoService(
            _ordemRepoMock.Object,
            _equipamentoRepoMock.Object,
            _tecnicoRepoMock.Object,
            _clienteRepoMock.Object,
            _mapper
        );
    }

    // ─── Testes CreateAsync ───────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_DeveCriarOrdem_QuandoDadosValidos()
    {
        // Arrange
        var equipamentoId = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        var tecnicoId = MongoDB.Bson.ObjectId.GenerateNewId().ToString();

        var dto = new OrdemServicoRequestDto
        {
            EquipamentoId = equipamentoId,
            TecnicoId = tecnicoId,
            ProblemaRelatado = "Tela não liga",
            Valor = 150.00m,
            Prioridade = PrioridadeOrdem.Alta
        };

        var equipamento = new Equipamento
        {
            Id = equipamentoId,
            Nome = "Samsung TV",
            ClienteId = MongoDB.Bson.ObjectId.GenerateNewId().ToString()
        };

        var tecnico = new Tecnico
        {
            Id = tecnicoId,
            Nome = "Carlos Silva"
        };

        _equipamentoRepoMock.Setup(r => r.GetByIdAsync(equipamentoId)).ReturnsAsync(equipamento);
        _tecnicoRepoMock.Setup(r => r.GetByIdAsync(tecnicoId)).ReturnsAsync(tecnico);
        _ordemRepoMock.Setup(r => r.CreateAsync(It.IsAny<OrdemServico>())).ReturnsAsync((OrdemServico o) => o);

        // Act
        var resultado = await _service.CreateAsync(dto);

        // Assert
        resultado.Should().NotBeNull();
        resultado.Status.Should().Be(StatusOrdem.Aberta);
        resultado.NomeEquipamento.Should().Be("Samsung TV");
        resultado.NomeTecnico.Should().Be("Carlos Silva");
    }

    [Fact]
    public async Task CreateAsync_DeveLancarExcecao_QuandoEquipamentoNaoExiste()
    {
        // Arrange
        var dto = new OrdemServicoRequestDto
        {
            EquipamentoId = "inexistente",
            TecnicoId = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            ProblemaRelatado = "Tela não liga",
            Valor = 150.00m,
            Prioridade = PrioridadeOrdem.Alta
        };

        _equipamentoRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<string>())).ReturnsAsync((Equipamento?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.CreateAsync(dto)
        );
    }

    [Fact]
    public async Task AtualizarStatusAsync_DeveFinalizarOrdem_QuandoStatusFinalizada()
    {
        // Arrange
        var ordemId = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        var equipamentoId = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        var tecnicoId = MongoDB.Bson.ObjectId.GenerateNewId().ToString();

        var ordem = new OrdemServico
        {
            Id = ordemId,
            EquipamentoId = equipamentoId,
            TecnicoId = tecnicoId,
            ProblemaRelatado = "Tela não liga",
            Status = StatusOrdem.EmAndamento,
            DataConclusao = null
        };

        var dto = new OrdemServicoAtualizarStatusDto
        {
            Status = StatusOrdem.Finalizada,
            Solucao = "Substituição da tela"
        };

        var equipamento = new Equipamento { Id = equipamentoId, Nome = "TV", ClienteId = MongoDB.Bson.ObjectId.GenerateNewId().ToString() };
        var tecnico = new Tecnico { Id = tecnicoId, Nome = "Carlos" };

        _ordemRepoMock.Setup(r => r.GetByIdAsync(ordemId)).ReturnsAsync(ordem);
        _ordemRepoMock.Setup(r => r.UpdateAsync(ordemId, It.IsAny<OrdemServico>())).Returns(Task.CompletedTask);
        _equipamentoRepoMock.Setup(r => r.GetByIdAsync(equipamentoId)).ReturnsAsync(equipamento);
        _tecnicoRepoMock.Setup(r => r.GetByIdAsync(tecnicoId)).ReturnsAsync(tecnico);

        // Act
        var resultado = await _service.AtualizarStatusAsync(ordemId, dto);

        // Assert
        resultado.Status.Should().Be(StatusOrdem.Finalizada);
        resultado.DataConclusao.Should().NotBeNull();
        resultado.Solucao.Should().Be("Substituição da tela");
    }

    [Fact]
    public async Task GetByIdAsync_DeveLancarExcecao_QuandoOrdemNaoExiste()
    {
        // Arrange
        _ordemRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<string>())).ReturnsAsync((OrdemServico?)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => _service.GetByIdAsync("inexistente")
        );
    }
}