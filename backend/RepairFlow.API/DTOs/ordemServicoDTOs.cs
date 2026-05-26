using RepairFlow.API.Models;

namespace RepairFlow.API.DTOs.OrdemServico;

public class OrdemServicoRequestDto
{
    public string EquipamentoId { get; set; } = string.Empty;
    public string TecnicoId { get; set; } = string.Empty;
    public string ProblemaRelatado { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public PrioridadeOrdem Prioridade { get; set; } = PrioridadeOrdem.Media;
    public string? Diagnostico { get; set; }
}

public class OrdemServicoAtualizarStatusDto
{
    public StatusOrdem Status { get; set; }
    public string? Diagnostico { get; set; }
    public string? Solucao { get; set; }
    public decimal? Valor { get; set; }
}

public class OrdemServicoResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string EquipamentoId { get; set; } = string.Empty;
    public string? NomeEquipamento { get; set; }
    public string TecnicoId { get; set; } = string.Empty;
    public string? NomeTecnico { get; set; }
    public string? ClienteId { get; set; }
    public string? NomeCliente { get; set; }
    public string ProblemaRelatado { get; set; } = string.Empty;
    public string? Diagnostico { get; set; }
    public string? Solucao { get; set; }
    public decimal Valor { get; set; }
    public StatusOrdem Status { get; set; }
    public PrioridadeOrdem Prioridade { get; set; }
    public DateTime DataAbertura { get; set; }
    public DateTime? DataConclusao { get; set; }
}

public class DashboardStatsDto
{
    public int TotalClientes { get; set; }
    public int TotalEquipamentos { get; set; }
    public int TotalTecnicos { get; set; }
    public int TotalOrdens { get; set; }
    public Dictionary<string, long> ContagemPorStatus { get; set; } = new();
    public int OrdensAlta { get; set; }
}