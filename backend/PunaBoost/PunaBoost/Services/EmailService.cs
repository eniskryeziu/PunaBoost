using Microsoft.Extensions.Options;
using PunaBoost.Interfaces;
using Resend;

namespace PunaBoost.Services;

public class EmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly ILogger<EmailService> _logger;
    private readonly string _fromEmail;
    private readonly string _baseUrl;

    public EmailService(IResend resend, ILogger<EmailService> logger, IConfiguration configuration)
    {
        _resend = resend;
        _logger = logger;
        _fromEmail = configuration["Resend:FromEmail"] ?? "noreply@punaboost.com";
        _baseUrl = configuration["Resend:BaseUrl"] ?? "http://localhost:5173";
    }

    public async Task SendEmailConfirmationAsync(string email, string confirmationCode)
    {
        try
        {
            var message = new EmailMessage();
            message.From = $"PunaBoost <{_fromEmail}>";
            message.To.Add(email);
            message.Subject = "Confirm Your Email - PunaBoost";
            
            var htmlBody = $@"
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body {{ 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #e5e7eb; 
                            background-color: #0f172a;
                            margin: 0;
                            padding: 0;
                        }}
                        .container {{ 
                            max-width: 600px; 
                            margin: 0 auto; 
                            padding: 20px; 
                        }}
                        .header {{ 
                            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                            color: white; 
                            padding: 30px 20px; 
                            text-align: center; 
                            border-radius: 10px 10px 0 0; 
                        }}
                        .header h1 {{
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                        }}
                        .content {{ 
                            background-color: #1e293b; 
                            padding: 40px 30px; 
                            border-radius: 0 0 10px 10px; 
                            border: 1px solid #334155;
                        }}
                        .content p {{
                            color: #cbd5e1;
                            margin: 0 0 20px 0;
                            font-size: 16px;
                        }}
                        .code-box {{ 
                            background-color: #0f172a; 
                            border: 2px solid #3b82f6; 
                            padding: 25px; 
                            text-align: center; 
                            margin: 30px 0; 
                            border-radius: 8px; 
                            word-break: break-all;
                            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
                        }}
                        .code {{ 
                            font-size: 18px; 
                            font-weight: 600; 
                            color: #60a5fa; 
                            font-family: 'Courier New', monospace; 
                            letter-spacing: 1px;
                        }}
                        .instruction {{
                            color: #94a3b8;
                            font-size: 14px;
                            margin-bottom: 15px;
                            text-align: center;
                        }}
                        .footer {{ 
                            text-align: center; 
                            margin-top: 30px; 
                            padding-top: 20px;
                            border-top: 1px solid #334155;
                            color: #64748b; 
                            font-size: 12px; 
                        }}
                        .footer p {{
                            margin: 5px 0;
                            color: #64748b;
                        }}
                        .warning {{
                            color: #94a3b8;
                            font-size: 13px;
                            margin-top: 20px;
                            font-style: italic;
                        }}
                    </style>
                </head>
                <body>
                    <div class=""container"">
                        <div class=""header"">
                            <h1>Welcome to PunaBoost!</h1>
                        </div>
                        <div class=""content"">
                            <p>Thank you for registering with PunaBoost. To complete your registration, please confirm your email address using the verification code below:</p>
                            
                            <div class=""instruction"">Enter this code on the email verification page:</div>
                            
                            <div class=""code-box"">
                                <div class=""code"">{confirmationCode}</div>
                            </div>
                            
                            <p class=""warning"">If you didn't create an account with PunaBoost, please ignore this email.</p>
                            
                            <div class=""footer"">
                                <p>This verification code will expire in 24 hours.</p>
                                <p>&copy; {DateTime.Now.Year} PunaBoost. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
            </html>";

            message.HtmlBody = htmlBody;

            await _resend.EmailSendAsync(message);
            _logger.LogInformation("Confirmation email sent successfully to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send confirmation email to {Email}", email);
            throw;
        }
    }
}

