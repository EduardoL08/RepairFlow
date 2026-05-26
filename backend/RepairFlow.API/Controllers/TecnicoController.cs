using Microsoft.AspNetCore.Mvc;
using RepairFlow.API.DTOs.Tecnico;
using RepairFlow.API.Services.Interfaces;

namespace RepairFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TecnicosController : ControllerBase
{
    private readonly ITecnicoService _service;

    public TecnicosController(ITecnicoService service)
    {
        _service = service;
    }

    /// <summary>Lista todos os técnicos.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TecnicoResponseDto>), 200)]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    /// <summary>Busca técnico por ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TecnicoResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(string id)
        => Ok(await _service.GetByIdAsync(id));

    /// <summary>Cadastra novo técnico.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(TecnicoResponseDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] TecnicoRequestDto dto)
    {
        var tecnico = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = tecnico.Id }, tecnico);
    }

    /// <summary>Atualiza um técnico.</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TecnicoResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(string id, [FromBody] TecnicoRequestDto dto)
        => Ok(await _service.UpdateAsync(id, dto));


    /// <summary>Remove um técnico.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}