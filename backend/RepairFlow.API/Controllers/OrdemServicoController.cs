using Microsoft.AspNetCore.Mvc;
using RepairFlow.API.DTOs.OrdemServico;
using RepairFlow.API.Models;
using RepairFlow.API.Services.Interfaces;

namespace RepairFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class OrdensServicoController : ControllerBase
{
    private readonly IOrdemServicoService _service;

    public OrdensServicoController(IOrdemServicoService service)
    {
        _service = service;
    }

    /// <summary>Lista todas as ordens de serviço, com filtro opcional por status.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<OrdemServicoResponseDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] StatusOrdem? status)
    {
        if (status.HasValue)
            return Ok(await _service.GetByStatusAsync(status.Value));

        return Ok(await _service.GetAllAsync());
    }

    /// <summary>Retorna estatísticas para o dashboard.</summary>
    /// IMPORTANTE: esta rota DEVE vir ANTES de GET /{id}
    /// para o roteador não interpretar "dashboard" como um ID.
    [HttpGet("dashboard")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetDashboard()
        => Ok(await _service.GetDashboardStatsAsync());

    /// <summary>Busca ordem de serviço por ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OrdemServicoResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(string id)
        => Ok(await _service.GetByIdAsync(id));

    /// <summary>Abre nova ordem de serviço.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(OrdemServicoResponseDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] OrdemServicoRequestDto dto)
    {
        var ordem = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = ordem.Id }, ordem);
    }

    /// <summary>Atualiza dados da ordem de serviço.</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(OrdemServicoResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(string id, [FromBody] OrdemServicoRequestDto dto)
        => Ok(await _service.UpdateAsync(id, dto));

    /// <summary>Atualiza apenas o status da ordem (e opcionalmente diagnóstico, solução e valor).</summary>
    [HttpPatch("{id}/status")]
    [ProducesResponseType(typeof(OrdemServicoResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AtualizarStatus(string id, [FromBody] OrdemServicoAtualizarStatusDto dto)
        => Ok(await _service.AtualizarStatusAsync(id, dto));

    /// <summary>Remove uma ordem de serviço.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}