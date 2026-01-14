using TaskManager.API.Models;

namespace TaskManager.API.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}
