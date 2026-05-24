using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RepairFlow.API.Models;

public class Equipamento
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("nome")]
    public string Nome { get; set; } = string.Empty;

    [BsonElement("marca")]
    public string Marca { get; set; } = string.Empty;

    [BsonElement("modelo")]
    public string Modelo { get; set; } = string.Empty;

    [BsonElement("numeroSerie")]
    public string NumeroSerie { get; set; } = string.Empty;

    [BsonElement("clienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string ClienteId { get; set; } = string.Empty;

    [BsonElement("categoria")]
    public string Categoria { get; set; } = string.Empty;

    [BsonElement("dataEntrada")]
    public DateTime DataEntrada { get; set; } = DateTime.UtcNow;
}