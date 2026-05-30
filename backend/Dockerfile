
# REPAIRFLOW — Backend Dockerfile
# Build multi-stage: compila com SDK, roda só com runtime


# ── ESTÁGIO 1: Compilar ────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copiar arquivos de projeto primeiro (cache de dependências)
COPY ["RepairFlow.API/RepairFlow.API.csproj", "RepairFlow.API/"]

# Restaurar pacotes NuGet
RUN dotnet restore "RepairFlow.API/RepairFlow.API.csproj"

# Copiar todo o código fonte
COPY . .

# Publicar versão Release
RUN dotnet publish "RepairFlow.API/RepairFlow.API.csproj" \
    -c Release \
    -o /app/publish

# ── ESTÁGIO 2: Executar ────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

# Copiar apenas os arquivos publicados (sem o SDK pesado)
COPY --from=build /app/publish .

EXPOSE 5000

ENTRYPOINT ["dotnet", "RepairFlow.API.dll"]