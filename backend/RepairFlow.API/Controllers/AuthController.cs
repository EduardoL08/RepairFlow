using Microsoft.AspNetCore.Mvc;
using RepairFlow.API.DTOs.Auth;
using RepairFlow.API.Services.Interfaces;

namespace RepairFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        var resultado = await _authService.LoginAsync(dto);
        return Ok(resultado);
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        var resultado = await _authService.RegisterAsync(dto);
        return StatusCode(201, resultado);
    }
}