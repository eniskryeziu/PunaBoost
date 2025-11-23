namespace PunaBoost.Interfaces;

public interface IEmailService
{
    Task SendEmailConfirmationAsync(string email, string confirmationCode);
}

