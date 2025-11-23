using PunaBoost.Models;

namespace PunaBoost.Interfaces
{
    public interface ITokenService
    {
        public string CreateToken(ApplicationUser user);
    }
}
