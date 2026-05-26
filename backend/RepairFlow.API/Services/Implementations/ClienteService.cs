using AutoMapper;
using RepairFlow.API.DTOs.Cliente;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Interfaces;
using RepairFlow.API.Services.Interfaces;

namespace RepairFlow.API.Services.Implementations;

public class ClienteService : IClienteService
{
    private readonly IClienteRepository _repository;
    private readonly IMapper _mapper;

    public ClienteService(IClienteRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ClienteResponseDto>> GetAllAsync()
    {
        var clientes = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<ClienteResponseDto>>(clientes);
    }

    public async Task<ClienteResponseDto> GetByIdAsync(string id)
    {
        var cliente = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Cliente com ID '{id}' não encontrado.");
        return _mapper.Map<ClienteResponseDto>(cliente);
    }

    public async Task<ClienteResponseDto> CreateAsync(ClienteRequestDto dto)
    {
        if (await _repository.CpfExisteAsync(dto.Cpf))
            throw new InvalidOperationException("CPF já cadastrado.");

        if (await _repository.EmailExisteAsync(dto.Email))
            throw new InvalidOperationException("E-mail já cadastrado.");

        var cliente = _mapper.Map<Cliente>(dto);
        cliente.DataCadastro = DateTime.UtcNow;

        await _repository.CreateAsync(cliente);
        return _mapper.Map<ClienteResponseDto>(cliente);
    }

    public async Task<ClienteResponseDto> UpdateAsync(string id, ClienteRequestDto dto)
    {
        var cliente = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Cliente com ID '{id}' não encontrado.");

        if (await _repository.CpfExisteAsync(dto.Cpf, id))
            throw new InvalidOperationException("CPF já cadastrado.");

        if (await _repository.EmailExisteAsync(dto.Email, id))
            throw new InvalidOperationException("E-mail já cadastrado.");

         _mapper.Map(dto, cliente);
        
        await _repository.UpdateAsync(id, cliente);
        return _mapper.Map<ClienteResponseDto>(cliente);

    }

    public async Task DeleteAsync(string id)
    {
        var existe = await _repository.ExistsAsync(id);
        if (!existe)
            throw new KeyNotFoundException($"Cliente com ID '{id}' não encontrado.");
        await _repository.DeleteAsync(id);
    }
}