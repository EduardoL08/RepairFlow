using AutoMapper;
using RepairFlow.API.DTOs.Equipamento;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Interfaces;
using RepairFlow.API.Services.Interfaces;

namespace RepairFlow.API.Services.Implementations;

public class EquipamentoService : IEquipamentoService
{
    private readonly IEquipamentoRepository _equipamentoRepository;
    private readonly IClienteRepository _clienteRepository;
    private readonly IMapper _mapper;

    public EquipamentoService(
        IEquipamentoRepository equipamentoRepository,
        IClienteRepository clienteRepository,
        IMapper mapper)
    {
        _equipamentoRepository = equipamentoRepository;
        _clienteRepository = clienteRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EquipamentoResponseDto>> GetAllAsync()
    {
        var equipamentos = await _equipamentoRepository.GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<EquipamentoResponseDto>>(equipamentos);

        foreach (var dto in dtos)
        {
            var cliente = await _clienteRepository.GetByIdAsync(dto.ClienteId);
            if (cliente != null)
                dto.NomeCliente = cliente.Nome;
        }

        return dtos;
    }

    public async Task<EquipamentoResponseDto> GetByIdAsync(string id)
    {
        var equipamento = await _equipamentoRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Equipamento com ID '{id}' não encontrado.");

        var dto = _mapper.Map<EquipamentoResponseDto>(equipamento);

        var cliente = await _clienteRepository.GetByIdAsync(equipamento.ClienteId);
        if (cliente != null)
            dto.NomeCliente = cliente.Nome;

        return dto;
    }

    public async Task<IEnumerable<EquipamentoResponseDto>> GetByClienteIdAsync(string clienteId)
    {
        var equipamentos = await _equipamentoRepository.GetByClienteIdAsync(clienteId);
        var dtos = _mapper.Map<IEnumerable<EquipamentoResponseDto>>(equipamentos);

        var cliente = await _clienteRepository.GetByIdAsync(clienteId);
        if (cliente != null)
        {
            foreach (var dto in dtos)
                dto.NomeCliente = cliente.Nome;
        }

        return dtos;
    }

    public async Task<EquipamentoResponseDto> CreateAsync(EquipamentoRequestDto dto)
    {
        var clienteExiste = await _clienteRepository.ExistsAsync(dto.ClienteId);
        if (!clienteExiste)
            throw new InvalidOperationException($"Cliente com ID '{dto.ClienteId}' não existe.");

        var numeroSerieExiste = await _equipamentoRepository.NumeroSerieExisteAsync(dto.NumeroSerie);
        if (numeroSerieExiste)
            throw new InvalidOperationException("Número de série já cadastrado.");

        var equipamento = _mapper.Map<Equipamento>(dto);
        await _equipamentoRepository.CreateAsync(equipamento);

        var cliente = await _clienteRepository.GetByIdAsync(equipamento.ClienteId);
        var responseDto = _mapper.Map<EquipamentoResponseDto>(equipamento);
        if (cliente != null)
            responseDto.NomeCliente = cliente.Nome;

        return responseDto;
    }

    public async Task<EquipamentoResponseDto> UpdateAsync(string id, EquipamentoRequestDto dto)
    {
        var equipamento = await _equipamentoRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Equipamento com ID '{id}' não encontrado.");

        var clienteExiste = await _clienteRepository.ExistsAsync(dto.ClienteId);
        if (!clienteExiste)
            throw new InvalidOperationException($"Cliente com ID '{dto.ClienteId}' não existe.");

        var numeroSerieExiste = await _equipamentoRepository.NumeroSerieExisteAsync(dto.NumeroSerie, id);
        if (numeroSerieExiste)
            throw new InvalidOperationException("Número de série já cadastrado.");

        _mapper.Map(dto, equipamento);

        await _equipamentoRepository.UpdateAsync(id, equipamento);

        var cliente = await _clienteRepository.GetByIdAsync(equipamento.ClienteId);
        var responseDto = _mapper.Map<EquipamentoResponseDto>(equipamento);
        if (cliente != null)
            responseDto.NomeCliente = cliente.Nome;

        return responseDto;
    }

    public async Task DeleteAsync(string id)
    {
        var existe = await _equipamentoRepository.ExistsAsync(id);
        if (!existe)
            throw new KeyNotFoundException($"Equipamento com ID '{id}' não encontrado.");
        await _equipamentoRepository.DeleteAsync(id);
    }
}