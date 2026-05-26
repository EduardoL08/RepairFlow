using RepairFlow.API.Configurations;
using RepairFlow.API.Mappings;
using RepairFlow.API.Middlewares;
using RepairFlow.API.Repositories.Implementations;
using RepairFlow.API.Repositories.Interfaces;
using RepairFlow.API.Services.Implementations;
using RepairFlow.API.Services.Interfaces;
using RepairFlow.API.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using MongoDB.Driver;
using Microsoft.OpenApi.Models;
using AutoMapper;


var builder = WebApplication.CreateBuilder(args);

// ____ Configurações tipadas _____________________________________________________________
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// ____ MongoDB _____________________________________________________________
builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(builder.Configuration["MongoDbSettings:ConnectionString"]!));

builder.Services.AddSingleton<IMongoDatabase>(sp =>
    sp.GetRequiredService<IMongoClient>()
      .GetDatabase(builder.Configuration["MongoDbSettings:DatabaseName"]!));

// ____ CORS _____________________________________________________________
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(o => o.AddPolicy("FrontendPolicy", p =>
    p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

// ____ AutoMapper _____________________________________________________________
var mapperConfig = new MapperConfiguration(cfg =>
{
    cfg.AddProfile<AutoMapperProfile>();
});
builder.Services.AddSingleton(mapperConfig.CreateMapper());

// ____ Repositórios _____________________________________________________________
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IEquipamentoRepository, EquipamentoRepository>();
builder.Services.AddScoped<ITecnicoRepository, TecnicoRepository>();
builder.Services.AddScoped<IOrdemServicoRepository, OrdemServicoRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();

// ____ Services  _____________________________________________________________
builder.Services.AddScoped<IClienteService, ClienteService>();

// ____ Validation  _____________________________________________________________
builder.Services.AddValidatorsFromAssemblyContaining<ClienteValidator>();
builder.Services.AddFluentValidationAutoValidation();


// ____ Controllers _____________________________________________________________
builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()));

// ____ Swagger _____________________________________________________________
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { 
        
        Title = "RepairFlow API", 
        Version = "v1",
        Description = "API REST para gerenciamento de assistência técnica de eletrônicos" 
        
        });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization. Informe: Bearer {seu_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ____ Build _____________________________________________________________
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "RepairFlow API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    Status = "Healthy",
    App = "RepairFlow API",
    Timestamp = DateTime.UtcNow
}));

app.Run();