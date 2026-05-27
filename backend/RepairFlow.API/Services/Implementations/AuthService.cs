using AutoMapper;
using RepairFlow.API.DTOs.Auth;
using RepairFlow.API.Models;
using RepairFlow.API.Repositories.Interfaces;
using RepairFlow.API.Services.Interfaces;

namespace RepairFlow.API.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly TokenService _tokenService;
    private readonly IMapper _mapper;

    public AuthService(
        IUsuarioRepository usuarioRepository,
        TokenService tokenService,
        IMapper mapper)
    {
        _usuarioRepository = usuarioRepository;
        _tokenService = tokenService;
        _mapper = mapper;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var usuario = await _usuarioRepository.GetByEmailAsync(dto.Email)
            ?? throw new UnauthorizedAccessException("E-mail ou senha inválidos.");

        var senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash);
        if (!senhaValida)
            throw new UnauthorizedAccessException("E-mail ou senha inválidos.");

        var token = _tokenService.GerarToken(usuario);
        var expiracao = DateTime.UtcNow.AddHours(8);

        return new AuthResponseDto
        {
            Token = token,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Role = usuario.Role,
            Expiracao = expiracao
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto dto)
    {
        var usuarioExiste = await _usuarioRepository.EmailExisteAsync(dto.Email);
        if (usuarioExiste)
            throw new InvalidOperationException("E-mail já cadastrado.");

        var senhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);

        var usuario = new Usuario
        {
            Nome = dto.Nome,
            Email = dto.Email,
            SenhaHash = senhaHash,
            Role = dto.Role
        };

        await _usuarioRepository.CreateAsync(usuario);

        var token = _tokenService.GerarToken(usuario);
        var expiracao = DateTime.UtcNow.AddHours(8);

        return new AuthResponseDto
        {
            Token = token,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Role = usuario.Role,
            Expiracao = expiracao
        };
    }
}