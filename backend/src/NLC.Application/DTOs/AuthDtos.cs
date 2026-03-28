namespace NLC.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record RefreshRequest(string RefreshToken);

public record UserDto(
    Guid   Id,
    string Email,
    string Role,
    Guid[] AssignedWarehouseIds
);
