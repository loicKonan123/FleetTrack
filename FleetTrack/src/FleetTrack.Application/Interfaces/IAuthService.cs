using FleetTrack.Application.DTOs.Auth;

namespace FleetTrack.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task RevokeTokenAsync(string username);
    Task<UserDto> GetUserByIdAsync(Guid userId);
    Task<UserDto> GetUserByUsernameAsync(string username);
}
