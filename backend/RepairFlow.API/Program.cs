using RepairFlow.API.Configurations;
using MongoDB.Driver;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ─── Configurações tipadas ───────────────────────────────────────────
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// ─── MongoDB ─────────────────────────────────────────────────────────
builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(builder.Configuration["MongoDbSettings:ConnectionString"]!));

builder.Services.AddSingleton<IMongoDatabase>(sp =>
    sp.GetRequiredService<IMongoClient>()
      .GetDatabase(builder.Configuration["MongoDbSettings:DatabaseName"]!));

// ─── CORS ─────────────────────────────────────────────────────────────
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(o => o.AddPolicy("FrontendPolicy", p =>
    p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

// ─── Controllers e Swagger ────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "RepairFlow API", Version = "v1" });
});

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