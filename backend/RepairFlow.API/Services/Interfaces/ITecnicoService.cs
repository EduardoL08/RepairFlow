using RepairFlow.API.DTOs.Tecnico;

namespace RepairFlow.API.Services.Interfaces;

public interface ITecnicoService
{
    Task<IEnumerable<TecnicoResponseDto>> GetAllAsync();
    Task<TecnicoResponseDto> GetByIdAsync(string id);
    Task<TecnicoResponseDto> CreateAsync(TecnicoRequestDto dto);
    Task<TecnicoResponseDto> UpdateAsync(string id, TecnicoRequestDto dto);
    Task DeleteAsync(string id);
}