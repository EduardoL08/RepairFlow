using FluentValidation;
using RepairFlow.API.DTOs.Equipamento;

namespace RepairFlow.API.Validators;

public class EquipamentoValidator : AbstractValidator<EquipamentoRequestDto>
{
    public EquipamentoValidator()
    {
        RuleFor(x => x.Nome)
            .NotEmpty().WithMessage("Nome do equipamento é obrigatório.")
            .MinimumLength(2).WithMessage("Nome deve ter no mínimo 2 caracteres.")
            .MaximumLength(150).WithMessage("Nome deve ter no máximo 150 caracteres.");

        RuleFor(x => x.Marca)
            .NotEmpty().WithMessage("Marca é obrigatória.")
            .MaximumLength(100).WithMessage("Marca deve ter no máximo 100 caracteres.");

        RuleFor(x => x.Modelo)
            .NotEmpty().WithMessage("Modelo é obrigatório.")
            .MaximumLength(100).WithMessage("Modelo deve ter no máximo 100 caracteres.");

        RuleFor(x => x.NumeroSerie)
            .NotEmpty().WithMessage("Número de série é obrigatório.")
            .MaximumLength(100).WithMessage("Número de série deve ter no máximo 100 caracteres.");

        RuleFor(x => x.ClienteId)
            .NotEmpty().WithMessage("ClienteId é obrigatório.")
            .Matches(@"^[0-9a-fA-F]{24}$").WithMessage("ClienteId inválido.");

        RuleFor(x => x.Categoria)
            .NotEmpty().WithMessage("Categoria é obrigatória.")
            .Must(c => new[] { "Computador", "Notebook", "Smartphone", "Tablet", "Impressora", "TV", "Console", "Outro" }.Contains(c))
            .WithMessage("Categoria inválida. Opções: Computador, Notebook, Smartphone, Tablet, Impressora, TV, Console, Outro.");
    }
}