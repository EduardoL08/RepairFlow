using AutoMapper;
using MongoDB.Driver;
using RepairFlow.API.DTOs.OrdemServico;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Interfaces;
using RepairFlow.API.Services.Interfaces;

namespace RepairFlow.API.Services.Implementations;

public class OrdemServicoService : IOrdemServicoService
{
    private readonly IOrdemServicoRepository _ordemRepository;
    private readonly IEquipamentoRepository _equipamentoRepository;
    private readonly ITecnicoRepository _tecnicoRepository;
    private readonly IClienteRepository _clienteRepository;
    private readonly IMapper _mapper;

    public OrdemServicoService(
        IOrdemServicoRepository ordemRepository,
        IEquipamentoRepository equipamentoRepository,
        ITecnicoRepository tecnicoRepository,
        IClienteRepository clienteRepository,
        IMapper mapper)
    {
        _ordemRepository = ordemRepository;
        _equipamentoRepository = equipamentoRepository;
        _tecnicoRepository = tecnicoRepository;
        _clienteRepository = clienteRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<OrdemServicoResponseDto>> GetAllAsync()
    {
        var ordens = await _ordemRepository.GetAllAsync();
        return await EnriquecerOrdensAsync(_mapper.Map<IEnumerable<OrdemServicoResponseDto>>(ordens));
    }

    public async Task<IEnumerable<OrdemServicoResponseDto>> GetByStatusAsync(StatusOrdem status)
    {
        var ordens = await _ordemRepository.GetByStatusAsync(status);
        return await EnriquecerOrdensAsync(_mapper.Map<IEnumerable<OrdemServicoResponseDto>>(ordens));
    }

    public async Task<OrdemServicoResponseDto> GetByIdAsync(string id)
    {
        var ordem = await _ordemRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Ordem de serviço com ID '{id}' não encontrada.");

        var dto = _mapper.Map<OrdemServicoResponseDto>(ordem);
        return (await EnriquecerOrdensAsync(new[] { dto })).First();
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var totalClientes = await _clienteRepository.CountAsync();
        var totalEquipamentos = await _equipamentoRepository.CountAsync();
        var totalTecnicos = await _tecnicoRepository.CountAsync();
        var totalOrdens = await _ordemRepository.CountAsync();
        var contagemPorStatus = await _ordemRepository.GetContagemPorStatusAsync();
        var ordensAlta = (int)await _ordemRepository.CountAsync(o =>
            o.Prioridade == PrioridadeOrdem.Alta &&
            o.Status != StatusOrdem.Finalizada);

        return new DashboardStatsDto
        {
            TotalClientes = (int)totalClientes,
            TotalEquipamentos = (int)totalEquipamentos,
            TotalTecnicos = (int)totalTecnicos,
            TotalOrdens = (int)totalOrdens,
            ContagemPorStatus = contagemPorStatus,
            OrdensAlta = ordensAlta
        };
    }

    public async Task<OrdemServicoResponseDto> CreateAsync(OrdemServicoRequestDto dto)
    {
        var equipamento = await _equipamentoRepository.GetByIdAsync(dto.EquipamentoId)
            ?? throw new KeyNotFoundException($"Equipamento com ID '{dto.EquipamentoId}' não existe.");

        var tecnico = await _tecnicoRepository.GetByIdAsync(dto.TecnicoId)
            ?? throw new KeyNotFoundException($"Técnico com ID '{dto.TecnicoId}' não existe.");

        var ordem = _mapper.Map<OrdemServico>(dto);
        await _ordemRepository.CreateAsync(ordem);

        var responseDto = _mapper.Map<OrdemServicoResponseDto>(ordem);
        responseDto.NomeEquipamento = equipamento.Nome;
        responseDto.NomeTecnico = tecnico.Nome;

        var cliente = await _clienteRepository.GetByIdAsync(equipamento.ClienteId);
        if (cliente != null)
        {
            responseDto.ClienteId = equipamento.ClienteId;
            responseDto.NomeCliente = cliente.Nome;
        }

        return responseDto;
    }

    public async Task<OrdemServicoResponseDto> UpdateAsync(string id, OrdemServicoRequestDto dto)
    {
        var ordem = await _ordemRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Ordem de serviço com ID '{id}' não encontrada.");

        var equipamento = await _equipamentoRepository.GetByIdAsync(dto.EquipamentoId)
            ?? throw new KeyNotFoundException($"Equipamento com ID '{dto.EquipamentoId}' não existe.");

        var tecnico = await _tecnicoRepository.GetByIdAsync(dto.TecnicoId)
            ?? throw new KeyNotFoundException($"Técnico com ID '{dto.TecnicoId}' não existe.");

        ordem.EquipamentoId = dto.EquipamentoId;
        ordem.TecnicoId = dto.TecnicoId;
        ordem.ProblemaRelatado = dto.ProblemaRelatado;
        ordem.Valor = dto.Valor;
        ordem.Prioridade = dto.Prioridade;
        ordem.Diagnostico = dto.Diagnostico;

        await _ordemRepository.UpdateAsync(id, ordem);

        var responseDto = _mapper.Map<OrdemServicoResponseDto>(ordem);
        responseDto.NomeEquipamento = equipamento.Nome;
        responseDto.NomeTecnico = tecnico.Nome;

        var cliente = await _clienteRepository.GetByIdAsync(equipamento.ClienteId);
        if (cliente != null)
        {
            responseDto.ClienteId = equipamento.ClienteId;
            responseDto.NomeCliente = cliente.Nome;
        }

        return responseDto;
    }

    public async Task<OrdemServicoResponseDto> AtualizarStatusAsync(string id, OrdemServicoAtualizarStatusDto dto)
    {
        var ordem = await _ordemRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Ordem de serviço com ID '{id}' não encontrada.");

        ordem.Status = dto.Status;

        if (!string.IsNullOrEmpty(dto.Diagnostico))
            ordem.Diagnostico = dto.Diagnostico;

        if (!string.IsNullOrEmpty(dto.Solucao))
            ordem.Solucao = dto.Solucao;

        if (dto.Valor.HasValue)
            ordem.Valor = dto.Valor.Value;

        if (dto.Status == StatusOrdem.Finalizada)
            ordem.DataConclusao = DateTime.UtcNow;

        await _ordemRepository.UpdateAsync(id, ordem);

        var responseDto = _mapper.Map<OrdemServicoResponseDto>(ordem);
        return (await EnriquecerOrdensAsync(new[] { responseDto })).First();
    }

    public async Task DeleteAsync(string id)
    {
        var existe = await _ordemRepository.ExistsAsync(id);
        if (!existe)
            throw new KeyNotFoundException($"Ordem de serviço com ID '{id}' não encontrada.");
        await _ordemRepository.DeleteAsync(id);
    }

    private async Task<IEnumerable<OrdemServicoResponseDto>> EnriquecerOrdensAsync(IEnumerable<OrdemServicoResponseDto> ordens)
    {
        foreach (var ordem in ordens)
        {
            var equipamento = await _equipamentoRepository.GetByIdAsync(ordem.EquipamentoId);
            if (equipamento != null)
            {
                ordem.NomeEquipamento = equipamento.Nome;

                var cliente = await _clienteRepository.GetByIdAsync(equipamento.ClienteId);
                if (cliente != null)
                {
                    ordem.ClienteId = equipamento.ClienteId;
                    ordem.NomeCliente = cliente.Nome;
                }
            }

            var tecnico = await _tecnicoRepository.GetByIdAsync(ordem.TecnicoId);
            if (tecnico != null)
                ordem.NomeTecnico = tecnico.Nome;
        }

        return ordens;
    }
}