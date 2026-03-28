using NLC.Application.DTOs;
using NLC.Infrastructure.Auth;

namespace NLC.API.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", async (LoginRequest req, AuthService auth) =>
        {
            var result = await auth.LoginAsync(req);
            return result is null
                ? Results.Unauthorized()
                : Results.Ok(result);
        })
        .AllowAnonymous()
        .WithSummary("Login with email and password");

        group.MapPost("/refresh", async (RefreshRequest req, AuthService auth) =>
        {
            var result = await auth.RefreshAsync(req.RefreshToken);
            return result is null
                ? Results.Unauthorized()
                : Results.Ok(result);
        })
        .AllowAnonymous()
        .WithSummary("Refresh access token");

        group.MapPost("/logout", async (RefreshRequest req, AuthService auth) =>
        {
            await auth.LogoutAsync(req.RefreshToken);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .WithSummary("Logout and revoke refresh token");

        return app;
    }
}
