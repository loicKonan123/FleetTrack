using System.Text.Json;
using FleetTrack.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FleetTrack.Infrastructure.Services;

public class CaptchaService : ICaptchaService
{
    private readonly HttpClient _httpClient;
    private readonly string _secretKey;
    private readonly bool _isEnabled;
    private readonly ILogger<CaptchaService> _logger;

    public CaptchaService(HttpClient httpClient, IConfiguration configuration, ILogger<CaptchaService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _secretKey = configuration["Captcha:SecretKey"] ?? "";
        _isEnabled = configuration.GetValue<bool>("Captcha:Enabled", false);
    }

    public async Task<bool> ValidateAsync(string? captchaToken)
    {
        // Si le captcha n'est pas active, on accepte toujours
        if (!_isEnabled)
        {
            _logger.LogDebug("CAPTCHA validation skipped - CAPTCHA is disabled");
            return true;
        }

        if (string.IsNullOrEmpty(captchaToken))
        {
            _logger.LogWarning("CAPTCHA token is null or empty");
            return false;
        }

        if (string.IsNullOrEmpty(_secretKey))
        {
            _logger.LogWarning("CAPTCHA SecretKey not configured");
            return true; // Let through if not configured
        }

        try
        {
            // reCAPTCHA Enterprise with legacy secret key uses the same siteverify endpoint
            var response = await _httpClient.PostAsync(
                $"https://www.google.com/recaptcha/api/siteverify?secret={_secretKey}&response={captchaToken}",
                null);

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<CaptchaResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result?.Success == true)
            {
                _logger.LogDebug("CAPTCHA validation successful. Score: {Score}", result.Score);
                return true;
            }

            _logger.LogWarning("CAPTCHA validation failed: {Errors}",
                string.Join(", ", result?.ErrorCodes ?? Array.Empty<string>()));
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating CAPTCHA");
            // En cas d'erreur, on laisse passer pour eviter de bloquer les utilisateurs
            return true;
        }
    }

    private class CaptchaResponse
    {
        public bool Success { get; set; }
        public double? Score { get; set; }
        public string? Action { get; set; }
        public DateTime? ChallengeTs { get; set; }
        public string? Hostname { get; set; }
        public string[]? ErrorCodes { get; set; }
    }
}
