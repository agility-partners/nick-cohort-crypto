using System.Net;
using System.Text.Json;

namespace CryptoApi.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public ErrorHandlingMiddleware(
        RequestDelegate next,
        ILogger<ErrorHandlingMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var requestId = Guid.NewGuid().ToString();
        context.Items["RequestId"] = requestId;

        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception. RequestId: {RequestId}, Path: {Path}",
                requestId, context.Request.Path);

            await WriteErrorResponse(context, ex, requestId);
        }
    }

    private async Task WriteErrorResponse(HttpContext context, Exception ex, string requestId)
    {
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        context.Response.ContentType = "application/json";

        var response = new Dictionary<string, string>
        {
            ["error"] = "An error occurred processing your request.",
            ["requestId"] = requestId,
        };

        if (_env.IsDevelopment())
        {
            response["message"] = ex.ToString();
        }

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true,
        });

        await context.Response.WriteAsync(json);
    }
}
