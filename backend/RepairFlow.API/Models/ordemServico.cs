using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RepairFlow.API.Models;

public enum StatusOrdem
{
    Aberta,
    EmAndamento,
    AguardandoPeca,
    Finalizada
}

public enum PrioridadeOrdem
{
    Baixa,
    Media,
    Alta
}

public class OrdemServico
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("equipamentoId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string EquipamentoId { get; set; } = string.Empty;

    [BsonElement("tecnicoId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string TecnicoId { get; set; } = string.Empty;

    [BsonElement("problemaRelatado")]
    public string ProblemaRelatado { get; set; } = string.Empty;

    [BsonElement("diagnostico")]
    public string? Diagnostico { get; set; }

    [BsonElement("solucao")]
    public string? Solucao { get; set; }

    [BsonElement("valor")]
    public decimal Valor { get; set; }

    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public StatusOrdem Status { get; set; } = StatusOrdem.Aberta;

    [BsonElement("prioridade")]
    [BsonRepresentation(BsonType.String)]
    public PrioridadeOrdem Prioridade { get; set; } = PrioridadeOrdem.Media;

    [BsonElement("dataAbertura")]
    public DateTime DataAbertura { get; set; } = DateTime.UtcNow;

    [BsonElement("dataConclusao")]
    public DateTime? DataConclusao { get; set; }
}