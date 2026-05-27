using Microsoft.AspNetCore.Mvc;
using RepairFlow.API.DTOs.Cliente;
using RepairFlow.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace RepairFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class ClientesController : ControllerBase
{
    private readonly IClienteService _service;

    public ClientesController(IClienteService service)
    {
        _service = service;
    }

    /// <summary>Lista todos os clientes.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ClienteResponseDto>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var clientes = await _service.GetAllAsync();
        return Ok(clientes);
    }


    /// <summary>Busca cliente por ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ClienteResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(string id)
    {
        var cliente = await _service.GetByIdAsync(id);
        return Ok(cliente);
    }

    /// <summary>Cria um novo cliente.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ClienteResponseDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> Create([FromBody] ClienteRequestDto dto)
    {
        var cliente = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
    }

    /// <summary>Atualiza um cliente existente.</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ClienteResponseDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(string id, [FromBody] ClienteRequestDto dto)
    {
        var cliente = await _service.UpdateAsync(id, dto);
        return Ok(cliente);
    }


    /// <summary>Remove um cliente.</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")] 
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(string id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}