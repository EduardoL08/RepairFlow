using AutoMapper;
using RepairFlow.API.DTOs.Tecnico;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Interfaces;
using RepairFlow.API.Services.Interfaces;

namespace RepairFlow.API.Services.Implementations;

public class TecnicoService : ITecnicoService
{
    private readonly ITecnicoRepository _repository;
    private readonly IMapper _mapper;

    public TecnicoService(ITecnicoRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TecnicoResponseDto>> GetAllAsync()
    {
        var tecnicos = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<TecnicoResponseDto>>(tecnicos);
    }

    public async Task<TecnicoResponseDto> GetByIdAsync(string id)
    {
        var tecnico = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Técnico com ID '{id}' não encontrado.");
        return _mapper.Map<TecnicoResponseDto>(tecnico);
    }

    public async Task<TecnicoResponseDto> CreateAsync(TecnicoRequestDto dto)
    {
        var emailExiste = await _repository.EmailExisteAsync(dto.Email);
        if (emailExiste)
            throw new InvalidOperationException("E-mail já cadastrado.");

        var tecnico = _mapper.Map<Tecnico>(dto);
        await _repository.CreateAsync(tecnico);
        return _mapper.Map<TecnicoResponseDto>(tecnico);
    }

    public async Task<TecnicoResponseDto> UpdateAsync(string id, TecnicoRequestDto dto)
    {
        var tecnico = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Técnico com ID '{id}' não encontrado.");

        var emailExiste = await _repository.EmailExisteAsync(dto.Email, id);
        if (emailExiste)
            throw new InvalidOperationException("E-mail já cadastrado.");

         _mapper.Map(dto, tecnico);
         
        await _repository.UpdateAsync(id, tecnico);
        return _mapper.Map<TecnicoResponseDto>(tecnico);
    }

    public async Task DeleteAsync(string id)
    {
        var existe = await _repository.ExistsAsync(id);
        if (!existe)
            throw new KeyNotFoundException($"Técnico com ID '{id}' não encontrado.");
        await _repository.DeleteAsync(id);
    }
}