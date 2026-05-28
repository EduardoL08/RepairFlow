using Xunit;
using FluentAssertions;
using FluentValidation;
using RepairFlow.API.DTOs.Cliente;
using RepairFlow.API.DTOs.Auth;
using RepairFlow.API.Validators;

namespace RepairFlow.Tests.Validators;

public class ClienteValidatorTests
{
    private readonly ClienteValidator _validator = new();

    [Fact]
    public void Validate_DevePassar_QuandoDadosValidos()
    {
        // Arrange
        var dto = new ClienteRequestDto
        {
            Nome = "João Silva",
            Cpf = "529.982.247-25",
            Telefone = "(11)99999-9999",
            Email = "joao@email.com",
            Endereco = "Rua das Flores, 123"
        };

        // Act
        var resultado = _validator.Validate(dto);

        // Assert
        resultado.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_DeveFalhar_QuandoNomeVazio()
    {
        // Arrange
        var dto = new ClienteRequestDto
        {
            Nome = "",
            Cpf = "529.982.247-25",
            Telefone = "(11) 99999-9999",
            Email = "joao@email.com",
            Endereco = "Rua das Flores, 123"
        };

        // Act
        var resultado = _validator.Validate(dto);

        // Assert
        resultado.IsValid.Should().BeFalse();
        resultado.Errors.Should().Contain(e => e.PropertyName == "Nome");
    }

    [Fact]
    public void Validate_DeveFalhar_QuandoCpfInvalido()
    {
        // Arrange
        var dto = new ClienteRequestDto
        {
            Nome = "João Silva",
            Cpf = "123.456.789-10",  // CPF inválido
            Telefone = "(11) 99999-9999",
            Email = "joao@email.com",
            Endereco = "Rua das Flores, 123"
        };

        // Act
        var resultado = _validator.Validate(dto);

        // Assert
        resultado.IsValid.Should().BeFalse();
        resultado.Errors.Should().Contain(e => e.PropertyName == "Cpf");
    }

    [Fact]
    public void Validate_DeveFalhar_QuandoEmailInvalido()
    {
        // Arrange
        var dto = new ClienteRequestDto
        {
            Nome = "João Silva",
            Cpf = "529.982.247-25",
            Telefone = "(11) 99999-9999",
            Email = "email-invalido",
            Endereco = "Rua das Flores, 123"
        };

        // Act
        var resultado = _validator.Validate(dto);

        // Assert
        resultado.IsValid.Should().BeFalse();
        resultado.Errors.Should().Contain(e => e.PropertyName == "Email");
    }
}

public class RegisterValidatorTests
{
    private readonly RegisterValidator _validator = new();

    [Fact]
    public void Validate_DevePassar_QuandoSenhaForte()
    {
        // Arrange
        var dto = new RegisterRequestDto
        {
            Nome = "João Silva",
            Email = "joao@email.com",
            Senha = "Senha123",
            Role = "usuario"
        };

        // Act
        var resultado = _validator.Validate(dto);

        // Assert
        resultado.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Validate_DeveFalhar_QuandoSenhaSemMaiuscula()
    {
        // Arrange
        var dto = new RegisterRequestDto
        {
            Nome = "João Silva",
            Email = "joao@email.com",
            Senha = "senha123",  // Sem maiúscula
            Role = "usuario"
        };

        // Act
        var resultado = _validator.Validate(dto);

        // Assert
        resultado.IsValid.Should().BeFalse();
        resultado.Errors.Should().Contain(e => e.PropertyName == "Senha");
    }

    [Fact]
    public void Validate_DeveFalhar_QuandoSenhaCurta()
    {
        // Arrange
        var dto = new RegisterRequestDto
        {
            Nome = "João Silva",
            Email = "joao@email.com",
            Senha = "Ab1",  // Muito curta
            Role = "usuario"
        };

        // Act
        var resultado = _validator.Validate(dto);

        // Assert
        resultado.IsValid.Should().BeFalse();
        resultado.Errors.Should().Contain(e => e.PropertyName == "Senha");
    }
}