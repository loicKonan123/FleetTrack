using FleetTrack.Application.DTOs.Common;
using FleetTrack.Application.Exceptions;
using System.Net;
using System.Text.Json;

namespace FleetTrack.API.Middlewares;

/// <summary>
/// Middleware pour la gestion globale des exceptions
/// </summary>
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Une erreur non gérée s'est produite: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiResponse<object>
        {
            Success = false
        };

        switch (exception)
        {
            case NotFoundException notFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                response.Message = notFoundException.Message;
                break;

            case ValidationException validationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = validationException.Message;
                response.Errors = validationException.Errors?.ToList();
                break;

            case BusinessException businessException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = businessException.Message;
                break;

            case FluentValidation.ValidationException fluentValidationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response.Message = "Erreur de validation";
                response.Errors = fluentValidationException.Errors
                    .Select(e => e.ErrorMessage)
                    .ToList();
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.Message = "Une erreur interne du serveur s'est produite";

                // En développement, on affiche les détails de l'erreur
                if (_environment.IsDevelopment())
                {
                    response.Message = exception.Message;
                    response.Errors = new List<string>
                    {
                        exception.StackTrace ?? "Pas de stack trace disponible"
                    };
                }
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}
