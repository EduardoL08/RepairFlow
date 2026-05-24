using AutoMapper;
using RepairFlow.API.Models;
using RepairFlow.API.DTOs.Cliente;
using RepairFlow.API.DTOs.Equipamento;
using RepairFlow.API.DTOs.Tecnico;
using RepairFlow.API.DTOs.OrdemServico;

namespace RepairFlow.API.Mappings;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        // Cliente
        CreateMap<ClienteRequestDto, Cliente>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.DataCadastro, o => o.Ignore());
        CreateMap<Cliente, ClienteResponseDto>()
            .ForMember(d => d.Id, o => o.MapFrom(s => s.Id.ToString()));

        // Equipamento
        CreateMap<EquipamentoRequestDto, Equipamento>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.DataEntrada, o => o.Ignore());
        CreateMap<Equipamento, EquipamentoResponseDto>()
            .ForMember(d => d.Id, o => o.MapFrom(s => s.Id.ToString()))
            .ForMember(d => d.NomeCliente, o => o.Ignore());

        // Tecnico
        CreateMap<TecnicoRequestDto, Tecnico>()
            .ForMember(d => d.Id, o => o.Ignore());
        CreateMap<Tecnico, TecnicoResponseDto>()
            .ForMember(d => d.Id, o => o.MapFrom(s => s.Id.ToString()));

        // OrdemServico
        CreateMap<OrdemServicoRequestDto, OrdemServico>()
            .ForMember(d => d.Id, o => o.Ignore())
            .ForMember(d => d.Status, o => o.MapFrom(_ => StatusOrdem.Aberta))
            .ForMember(d => d.DataAbertura, o => o.Ignore())
            .ForMember(d => d.DataConclusao, o => o.Ignore());
        CreateMap<OrdemServico, OrdemServicoResponseDto>()
            .ForMember(d => d.Id, o => o.MapFrom(s => s.Id.ToString()))
            .ForMember(d => d.NomeEquipamento, o => o.Ignore())
            .ForMember(d => d.NomeTecnico, o => o.Ignore())
            .ForMember(d => d.NomeCliente, o => o.Ignore());
    }
}