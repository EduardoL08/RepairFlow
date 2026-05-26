using FluentValidation;
using RepairFlow.API.DTOs.OrdemServico;

namespace RepairFlow.API.Validators;

public class OrdemServicoValidator : AbstractValidator<OrdemServicoRequestDto>
{
    public OrdemServicoValidator()
    {
        RuleFor(x => x.EquipamentoId)
            .NotEmpty().WithMessage("EquipamentoId é obrigatório.")
            .Matches(@"^[0-9a-fA-F]{24}$").WithMessage("EquipamentoId inválido.");

        RuleFor(x => x.TecnicoId)
            .NotEmpty().WithMessage("TecnicoId é obrigatório.")
            .Matches(@"^[0-9a-fA-F]{24}$").WithMessage("TecnicoId inválido.");

        RuleFor(x => x.ProblemaRelatado)
            .NotEmpty().WithMessage("Problema relatado é obrigatório.")
            .MinimumLength(10).WithMessage("Problema deve ter no mínimo 10 caracteres.")
            .MaximumLength(1000).WithMessage("Problema deve ter no máximo 1000 caracteres.");

        RuleFor(x => x.Valor)
            .GreaterThanOrEqualTo(0).WithMessage("Valor não pode ser negativo.");

        RuleFor(x => x.Prioridade)
            .IsInEnum().WithMessage("Prioridade inválida. Opções: Baixa, Media ou Alta");
    }
}

public class OrdemServicoAtualizarStatusValidator : AbstractValidator<OrdemServicoAtualizarStatusDto>
{
    public OrdemServicoAtualizarStatusValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Status inválido. Opções: Aberta, EmAndamento, AguardandoPeca ou Finalizada.");

        RuleFor(x => x.Diagnostico)
            .MaximumLength(1000).WithMessage("Diagnóstico deve ter no máximo 1000 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Diagnostico));

        RuleFor(x => x.Solucao)
            .MaximumLength(1000).WithMessage("Solução deve ter no máximo 1000 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.Solucao));

        RuleFor(x => x.Valor)
            .GreaterThanOrEqualTo(0).WithMessage("Valor não pode ser negativo.")
            .When(x => x.Valor.HasValue);
    }
}