using PunaBoost.Interfaces;

namespace PunaBoost.Services;

public class EmailBackgroundJobService
{
    private readonly IEmailService _emailService;

    public EmailBackgroundJobService(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task SendConfirmationEmailAsync(string email, string confirmationCode)
    {
        await _emailService.SendEmailConfirmationAsync(email, confirmationCode);
    }
}

