using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PunaBoost.Data;
using PunaBoost.Dtos.Account;
using PunaBoost.Dtos.Account.Candidate;
using PunaBoost.Dtos.Account.Company;
using PunaBoost.Extensions;
using PunaBoost.Interfaces;
using PunaBoost.Models;
using PunaBoost.Services;
using Hangfire;
using PunaBoost.Dtos;

namespace PunaBoost.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ITokenService _tokenService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly AppDbContext _context;
        private readonly IFileService _fileService;
        private readonly IEmailService _emailService;
        public AccountController(
            ITokenService tokenService, 
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            AppDbContext context,
            IFileService fileService,
            IEmailService emailService
            )
        {
            _tokenService = tokenService;
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _fileService = fileService;
            _emailService = emailService;
        }

        [HttpPost("register/company")]
        public async Task<IActionResult> RegisterCompany([FromForm] CompanyCreateDto dto, IFormFile file)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                if (existingUser != null)
                    return BadRequest("Email already exists.");
                var appUser = new ApplicationUser
                {
                    UserName = dto.CompanyName.ToLower().Replace(" ", ""),
                    Email = dto.Email,
                    PhoneNumber = dto.PhoneNumber,
                };

                var createUser = await _userManager.CreateAsync(appUser, dto.Password);
                if (!createUser.Succeeded)
                    return StatusCode(500, createUser.Errors);

                var roleResult = await _userManager.AddToRoleAsync(appUser, "company");
                if (!roleResult.Succeeded)
                    return StatusCode(500, roleResult.Errors);

                var logo = await _fileService.SaveCompanyLogoAsync(file);
                var company = new Company
                {
                    CompanyName = dto.CompanyName,
                    Description = dto.Description,
                    LogoUrl = logo,
                    Website = dto.Website,
                    Location = dto.Location,
                    FoundedYear = dto.FoundedYear,
                    NumberOfEmployees = dto.NumberOfEmployees,
                    CountryId = dto.CountryId,
                    CityId = dto.CityId,
                    UserId = appUser.Id,
                };

                _context.Companies.Add(company);
                await _context.SaveChangesAsync();
                
                var confirmationCode = await _userManager.GenerateEmailConfirmationTokenAsync(appUser);
                
                BackgroundJob.Schedule<EmailBackgroundJobService>(
                    service => service.SendConfirmationEmailAsync(appUser.Email, confirmationCode),
                    TimeSpan.FromSeconds(5));
                
                return Ok(new
                {
                    message = "Company registered successfully. Please check your email for the confirmation code.",
                    email = appUser.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpPost("register/candidate")]
        public async Task<IActionResult> RegisterCandidate([FromForm] CandidateCreateDto dto, IFormFile file)
        {
            try
            {
      
                if (file == null || file.Length == 0)
                    return BadRequest("Resume file is required.");

                var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                if (existingUser != null)
                    return BadRequest("Email already exists.");

                var appUser = new ApplicationUser
                {
                    UserName = dto.Email,
                    Email = dto.Email,
                    PhoneNumber = dto.PhoneNumber,
                };

                var createUser = await _userManager.CreateAsync(appUser, dto.Password);
                if (!createUser.Succeeded)
                    return StatusCode(500, createUser.Errors);

                var roleResult = await _userManager.AddToRoleAsync(appUser, "candidate");
                if (!roleResult.Succeeded)
                    return StatusCode(500, roleResult.Errors);

                var candidate = new Candidate
                {
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    UserId = appUser.Id,
                };

                _context.Candidates.Add(candidate);
                await _context.SaveChangesAsync();

                
                var fileUrl = await _fileService.SaveResumeAsync(file);
                var fileName = file.FileName;

    
                var resume = new Resume
                {
                    FileName = fileName,
                    FileUrl = fileUrl,
                    Name = fileName, 
                    CandidateId = candidate.Id,
                    IsDefault = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Resumes.Add(resume);
                await _context.SaveChangesAsync();

                var confirmationCode = await _userManager.GenerateEmailConfirmationTokenAsync(appUser);
          
                BackgroundJob.Schedule<EmailBackgroundJobService>(
                    service => service.SendConfirmationEmailAsync(appUser.Email, confirmationCode),
                    TimeSpan.FromSeconds(5));

                return Ok(new
                {
                    message = "Candidate registered successfully. Please check your email for the confirmation code.",
                    email = appUser.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("email-verification")]
        public async Task<IActionResult> EmailVerification([FromQuery] string email, [FromQuery] string code)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(code))
                return BadRequest("Invalid payload");

            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return BadRequest("Invalid email");

            var isVerified = await _userManager.ConfirmEmailAsync(user, code);
            if (!isVerified.Succeeded)
                return BadRequest("Verification failed. The email or code may be incorrect.");

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new
            {
                Email = user.Email,
                Token = _tokenService.CreateToken(user),
                Role = roles.FirstOrDefault() ?? "None"
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
                return Unauthorized("Invalid credentials. Please check your email and password.");

            if (!user.EmailConfirmed)
                return BadRequest("Please verify your email before logging in.");

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new
            {
                Email = user.Email,
                Token = _tokenService.CreateToken(user),
                Role = roles.FirstOrDefault() ?? "None"
            });
        }

        [HttpPut("company/logo")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Company")]
        public async Task<IActionResult> UpdateCompanyLogo(IFormFile file)
        {
            try
            {
                var email = User.GetUserEmail();
                if (string.IsNullOrEmpty(email))
                    return Unauthorized();

                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                    return NotFound("User not found");

                var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == user.Id);
                if (company == null)
                    return NotFound("Company not found");

                if (!string.IsNullOrEmpty(company.LogoUrl))
                {
                    await _fileService.DeleteCompanyLogoAsync(company.LogoUrl);
                }

 
                var logo = await _fileService.SaveCompanyLogoAsync(file);
                company.LogoUrl = logo;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Logo updated successfully", logoUrl = logo });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        // TEST 
        [HttpPost("register/admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] AdminCreateDto dto)
        {
            try
            {
                var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                if (existingUser != null)
                    return BadRequest("Email already exists.");

                var appUser = new ApplicationUser
                {
                    UserName = dto.Email,
                    Email = dto.Email,
                    PhoneNumber = dto.PhoneNumber,
                };

                var createUser = await _userManager.CreateAsync(appUser, dto.Password);
                if (!createUser.Succeeded)
                    return StatusCode(500, createUser.Errors);

                var roleResult = await _userManager.AddToRoleAsync(appUser, "admin");
                if (!roleResult.Succeeded)
                    return StatusCode(500, roleResult.Errors);

                var token = await _userManager.GenerateEmailConfirmationTokenAsync(appUser);
                await _userManager.ConfirmEmailAsync(appUser, token);

                return Ok(new
                {
                    message = "Admin registered successfully.",
                    email = appUser.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
