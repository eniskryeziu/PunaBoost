using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace PunaBoost.Extensions
{
    public static class ClaimsExtensions
    {
        public static string GetUserEmail(this ClaimsPrincipal user)
        {
            return user?.FindFirst(JwtRegisteredClaimNames.Email)?.Value 
                ?? user?.FindFirst(ClaimTypes.Email)?.Value;
        }
    }
}
