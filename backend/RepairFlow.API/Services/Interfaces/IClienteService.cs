using RepairFlow.API.DTOs.Cliente;

namespace RepairFlow.API.Services.Interfaces;

public interface IClienteService
{
    Task<IEnumerable<ClienteResponseDto>> GetAllAsync();
    Task<ClienteResponseDto> GetByIdAsync(string id);
    Task<ClienteResponseDto> CreateAsync(ClienteRequestDto dto);
    Task<ClienteResponseDto> UpdateAsync(string id, ClienteRequestDto dto);
    Task DeleteAsync(string id);
}