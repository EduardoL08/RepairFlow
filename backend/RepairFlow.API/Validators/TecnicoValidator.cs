using FluentValidation;
using RepairFlow.API.DTOs.Tecnico;

namespace RepairFlow.API.Validators;

public class TecnicoValidator : AbstractValidator<TecnicoRequestDto>
{
    public TecnicoValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome é obrigatório.")
            .MinimumLength(3).WithMessage("Nome deve ter no mínimo 3 caracteres.")
            .MaximumLength(150).WithMessage("Nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Especialidade)
            .NotEmpty().WithMessage("Especialidade é obrigatória.")
            .Must(e => new[] { "Eletrônica Geral", "Smartphones", "Computadores", "Notebooks", "Impressoras", "TVs e Monitores", "Consoles", "Eletrodomésticos", "Outro" }.Contains(e))
            .WithMessage("Especialidade inválida.");

        RuleFor(x => x.Telefone)
            .NotEmpty().WithMessage("Telefone é obrigatório.")
            .Matches(@"^\(?[0-9]{2}\)?[0-9]{4,5}-?[0-9]{4}$")
            .WithMessage("Telefone inválido. Use o formato (11)99999-9999");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail é obrigatório.")
            .EmailAddress().WithMessage("E-mail inválido.");
    }
}