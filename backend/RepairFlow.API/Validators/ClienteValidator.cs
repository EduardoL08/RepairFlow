using FluentValidation;
using RepairFlow.API.DTOs.Cliente;

namespace RepairFlow.API.Validators;

public class ClienteValidator : AbstractValidator<ClienteRequestDto>
{
    public ClienteValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MinimumLength(3).WithMessage("Nome deve ter no mínimo 3 caracteres.")
            .MaximumLength(150).WithMessage("Nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Cpf)
            .NotEmpty().WithMessage("CPF é obrigatório.")
            .Must(ValidarCpf).WithMessage("CPF inválido. Tem que ser um CPF real");

        RuleFor(x => x.Telefone)
            .NotEmpty().WithMessage("Telefone é obrigatório.")
            .Matches(@"^\(?[0-9]{2}\)?[0-9]{4,5}-?[0-9]{4}$")
            .WithMessage("Telefone inválido. Use o formato (11)99999-9999");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail é obrigatório.")
            .EmailAddress().WithMessage("E-mail inválido.");

        RuleFor(x => x.Endereco)
            .NotEmpty().WithMessage("Endereço é obrigatório.")
            .MaximumLength(300).WithMessage("Endereço deve ter no máximo 300 caracteres.");
    }

    private static bool ValidarCpf(string cpf)
    {
        cpf = new string(cpf.Where(char.IsDigit).ToArray());
        if (cpf.Length != 11 || cpf.Distinct().Count() == 1) return false;

        int[] multiplicadores1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
        int[] multiplicadores2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

        var soma1 = cpf.Take(9).Select((d, i) => int.Parse(d.ToString()) * multiplicadores1[i]).Sum();
        var resto1 = soma1 % 11;
        var dig1 = resto1 < 2 ? 0 : 11 - resto1;

        var soma2 = cpf.Take(10).Select((d, i) => int.Parse(d.ToString()) * multiplicadores2[i]).Sum();
        var resto2 = soma2 % 11;
        var dig2 = resto2 < 2 ? 0 : 11 - resto2;

        return cpf[9] == dig1.ToString()[0] && cpf[10] == dig2.ToString()[0];
    }
}