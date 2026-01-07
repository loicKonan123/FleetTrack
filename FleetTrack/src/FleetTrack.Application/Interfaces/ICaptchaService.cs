namespace FleetTrack.Application.Interfaces;

public interface ICaptchaService
{
    Task<bool> ValidateAsync(string? captchaToken);
}
