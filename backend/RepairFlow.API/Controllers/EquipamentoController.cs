using Microsoft.AspNetCore.Mvc;
using RepairFlow.API.DTOs.Equipamento;
using RepairFlow.API.Services.Interfaces;

namespace RepairFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class EquipamentosController : ControllerBase
{
    private readonly IEquipamentoService _service;

    public EquipamentosController(IEquipamentoService service)
    {
        _service = service;
    }

    /// <summary>Lista todos os equipamentos.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<EquipamentoResponseDto>), 200)]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    /// <summary>Busca equipamento por ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EquipamentoResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(string id)
        => Ok(await _service.GetByIdAsync(id));

    /// <summary>Lista equipamentos de um cliente específico.</summary>
    [HttpGet("cliente/{clienteId}")]
    [ProducesResponseType(typeof(IEnumerable<EquipamentoResponseDto>), 200)]
    public async Task<IActionResult> GetByCliente(string clienteId)
        => Ok(await _service.GetByClienteIdAsync(clienteId));

    /// <summary>Cadastra novo equipamento.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(EquipamentoResponseDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> Create([FromBody] EquipamentoRequestDto dto)
    {
        var equipamento = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = equipamento.Id }, equipamento);
    }

    /// <summary>Atualiza um equipamento.</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(EquipamentoResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(string id, [FromBody] EquipamentoRequestDto dto)
        => Ok(await _service.UpdateAsync(id, dto));

    /// <summary>Remove um equipamento.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}