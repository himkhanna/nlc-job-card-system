using Microsoft.EntityFrameworkCore;
using NLC.Application.DTOs;
using NLC.Infrastructure.Data;
using StackExchange.Redis;

namespace NLC.Infrastructure.Auth;

public class AuthService(NlcDbContext db, TokenService tokens, IConnectionMultiplexer redis)
{
    private readonly IDatabase _cache = redis.GetDatabase();
    private const string RefreshPrefix = "refresh:";

    public async Task<LoginResponse?> LoginAsync(LoginRequest req)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == req.Email && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return null;

        var accessToken  = tokens.GenerateAccessToken(user);
        var refreshToken = tokens.GenerateRefreshToken();
        var expiry       = tokens.RefreshTokenExpiry;

        // Store refresh token in Redis (best-effort — continues if Redis is unavailable)
        try
        {
            await _cache.StringSetAsync(
                $"{RefreshPrefix}{refreshToken}",
                user.Id.ToString(),
                expiry - DateTime.UtcNow
            );
        }
        catch { /* Redis unavailable in dev — access token still works */ }

        return new LoginResponse(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddMinutes(60),
            new UserDto(user.Id, user.Email, user.Name, user.Role.ToString(), user.AssignedWarehouseIds)
        );
    }

    public async Task<LoginResponse?> RefreshAsync(string refreshToken)
    {
        try
        {
            var userIdStr = await _cache.StringGetAsync($"{RefreshPrefix}{refreshToken}");
            if (userIdStr.IsNullOrEmpty) return null;

            var userId = Guid.Parse(userIdStr!);
            var user   = await db.Users.FindAsync(userId);
            if (user is null || !user.IsActive) return null;

            // Rotate: delete old, issue new
            await _cache.KeyDeleteAsync($"{RefreshPrefix}{refreshToken}");

            var newAccess  = tokens.GenerateAccessToken(user);
            var newRefresh = tokens.GenerateRefreshToken();
            var expiry     = tokens.RefreshTokenExpiry;

            await _cache.StringSetAsync(
                $"{RefreshPrefix}{newRefresh}",
                user.Id.ToString(),
                expiry - DateTime.UtcNow
            );

            return new LoginResponse(
                newAccess,
                newRefresh,
                DateTime.UtcNow.AddMinutes(60),
                new UserDto(user.Id, user.Email, user.Name, user.Role.ToString(), user.AssignedWarehouseIds)
            );
        }
        catch { return null; }
    }

    public async Task LogoutAsync(string refreshToken)
    {
        try { await _cache.KeyDeleteAsync($"{RefreshPrefix}{refreshToken}"); }
        catch { /* best-effort */ }
    }
}
