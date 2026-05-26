using RepairFlow.API.DTOs.Equipamento;

namespace RepairFlow.API.Services.Interfaces;

public interface IEquipamentoService
{
    Task<IEnumerable<EquipamentoResponseDto>> GetAllAsync();
    Task<EquipamentoResponseDto> GetByIdAsync(string id);
    Task<IEnumerable<EquipamentoResponseDto>> GetByClienteIdAsync(string clienteId);
    Task<EquipamentoResponseDto> CreateAsync(EquipamentoRequestDto dto);
    Task<EquipamentoResponseDto> UpdateAsync(string id, EquipamentoRequestDto dto);
    Task DeleteAsync(string id);
}