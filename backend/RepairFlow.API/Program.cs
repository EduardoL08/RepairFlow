using RepairFlow.API.Configurations;
using RepairFlow.API.Extensions;
using RepairFlow.API.Mappings;
using RepairFlow.API.Middlewares;
using MongoDB.Driver;
using AutoMapper;
using AutoPrime.API.Configurations;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

// ____ Configurações tipadas _____________________________________________________________
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

    builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("JwtSettings"));

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


// ─── DI via extensões (SRP) ───────────────────────────────────────────
builder.Services.AddRepositories();
builder.Services.AddServices();
builder.Services.AddValidators();
builder.Services.AddJwtAuthentication(builder.Configuration);

// ____ Controllers _____________________________________________________________
builder.Services.AddControllers()
    .AddJsonOptions(o =>
        o.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()));

// ____ Swagger _____________________________________________________________
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerConfiguration();

// ____ Build _____________________________________________________________
var app = builder.Build();

app.UseSwaggerConfiguration();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();