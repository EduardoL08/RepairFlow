using RepairFlow.API.DTOs.OrdemServico;
using RepairFlow.API.Models;

namespace RepairFlow.API.Services.Interfaces;

public interface IOrdemServicoService
{
    Task<IEnumerable<OrdemServicoResponseDto>> GetAllAsync();
    Task<IEnumerable<OrdemServicoResponseDto>> GetByStatusAsync(StatusOrdem status);
    Task<OrdemServicoResponseDto> GetByIdAsync(string id);
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<OrdemServicoResponseDto> CreateAsync(OrdemServicoRequestDto dto);
    Task<OrdemServicoResponseDto> UpdateAsync(string id, OrdemServicoRequestDto dto);
    Task<OrdemServicoResponseDto> AtualizarStatusAsync(string id, OrdemServicoAtualizarStatusDto dto);
    Task DeleteAsync(string id);
}

