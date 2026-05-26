using Microsoft.OpenApi.Models;

namespace AutoPrime.API.Configurations;

/// <summary>
/// Extensão para configurar o Swagger/OpenAPI na aplicação.
/// Separamos essa lógica do Program.cs para manter o código limpo (SRP).
/// </summary>
public static class SwaggerConfiguration {   
    
    /// <summary>
    /// Registra os serviços do Swagger no container de DI.
    /// </summary>
    public static IServiceCollection AddSwaggerConfiguration(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "RepairFlow API",
                Version = "v1",
                Description = "API REST para gerenciamento de assistência técnica de eletrônicos ",
                Contact = new OpenApiContact
                {
                    Name = "Eduardo Lourenço Rodrigues",
                    Email ="edulourenco321@gmail.com"
                }
            });

            // Configuração do JWT no Swagger — aparece o botão "Authorize"
            var securityScheme = new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Description = "Insira o token JWT no formato: Bearer {seu_token}",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            };

            options.AddSecurityDefinition("Bearer", securityScheme);

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                { securityScheme, Array.Empty<string>() }
            });
        });

        return services;
    }

    /// <summary>
    /// Ativa o middleware do Swagger no pipeline HTTP.
    /// </summary>
    public static IApplicationBuilder UseSwaggerConfiguration(this IApplicationBuilder app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "RepairFlow API v1");
            options.RoutePrefix = string.Empty; // Swagger abre na raiz: http://localhost:5000/
            options.DocumentTitle = "RepairFlow - API Docs";
        });

        return app;
    }
}