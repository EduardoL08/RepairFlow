namespace RepairFlow.API.DTOs.Equipamento;

public class EquipamentoRequestDto
{
    public string Nome { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string NumeroSerie { get; set; } = string.Empty;
    public string ClienteId { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
}

public class EquipamentoResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string NumeroSerie { get; set; } = string.Empty;
    public string ClienteId { get; set; } = string.Empty;
    public string? NomeCliente { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public DateTime DataEntrada { get; set; }
}