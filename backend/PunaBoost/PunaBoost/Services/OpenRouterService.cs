using System.Net.Http;
using System.Text;
using System.Text.Json;
using PunaBoost.Dtos;

namespace PunaBoost.Services
{
    public interface IOpenRouterService
    {
        Task<List<JobRecommendationDto>> GetJobRecommendationsAsync(string resumeText, List<JobDto> jobs);
    }

    public class OpenRouterService : IOpenRouterService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<OpenRouterService> _logger;

        public OpenRouterService(
            HttpClient httpClient, 
            IConfiguration configuration,
            ILogger<OpenRouterService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            
            _httpClient.BaseAddress = new Uri("https://openrouter.ai/api/v1/");
        }

        public async Task<List<JobRecommendationDto>> GetJobRecommendationsAsync(string resumeText, List<JobDto> jobs)
        {
            if (string.IsNullOrWhiteSpace(resumeText) || !jobs.Any())
            {
                return new List<JobRecommendationDto>();
            }

            var apiKey = _configuration["OpenRouter:AIApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogWarning("OpenRouter API key is not configured");
                return new List<JobRecommendationDto>();
            }

            try
            {
                var jobsSummary = jobs.Select(job => new
                {
                    Id = job.Id.ToString(),
                    Title = job.Title,
                    Description = job.Description ?? string.Empty,
                    Location = job.Location ?? string.Empty,
                    Country = job.CountryName ?? string.Empty,
                    City = job.CityName ?? string.Empty,
                    Company = job.CompanyName ?? string.Empty,
                    Industry = job.IndustryName ?? string.Empty,
                    RequiredSkills = job.Skills?.Select(s => s.SkillName).ToList() ?? new List<string>(),
                    IsRemote = job.IsRemote,
                    SalaryFrom = job.SalaryFrom,
                    SalaryTo = job.SalaryTo,
                    PostedAt = job.PostedAt.ToString("yyyy-MM-dd"),
                    ExpiresAt = job.ExpiresAt?.ToString("yyyy-MM-dd") ?? string.Empty
                }).ToList();

                var prompt = BuildPrompt(resumeText, jobsSummary);

                var requestBody = new
                {
                    model = "openai/gpt-oss-20b:free",
                    messages = new[]
                    {
                        new
                        {
                            role = "system",
                            content = "You are an expert AI job matching assistant specializing in analyzing CVs/resumes in Albanian and English. Your task is to deeply analyze candidate qualifications, skills, experience, education, and preferences, then match them with available job positions. Provide accurate, professional recommendations with detailed explanations. Only recommend jobs with genuine compatibility (minimum 60% match). If no suitable matches exist, return an empty array. Always respond in the same language as the CV (Albanian or English)."
                        },
                        new
                        {
                            role = "user",
                            content = prompt
                        }
                    },
                    temperature = 0.2,
                    max_tokens = 3000
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var request = new HttpRequestMessage(HttpMethod.Post, "chat/completions")
                {
                    Content = content
                };
                request.Headers.Add("Authorization", $"Bearer {apiKey}");
                request.Headers.Add("HTTP-Referer", _configuration["OpenRouter:Referer"] ?? "https://punaboost.com");
                request.Headers.Add("X-Title", "PunaBoost AI Job Matcher");

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseJson = JsonDocument.Parse(responseContent);

                var recommendations = ParseRecommendations(responseJson, jobs);
                return recommendations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting job recommendations from OpenRouter");
                return new List<JobRecommendationDto>();
            }
        }

        private string BuildPrompt(string resumeText, object jobs)
        {
            var jobsJson = JsonSerializer.Serialize(jobs, new JsonSerializerOptions { WriteIndented = true });
            
            return $@"You are an expert job matching AI. Analyze the candidate's CV/resume (which may be in Albanian or English) and find the best matching job opportunities.

CANDIDATE'S CV/RESUME:
{resumeText}

AVAILABLE JOB POSITIONS:
{jobsJson}

DETAILED ANALYSIS INSTRUCTIONS:

1. CV ANALYSIS (Extract and analyze):
   - Professional skills and technical competencies
   - Years of experience and work history
   - Education level and qualifications
   - Certifications and specializations
   - Languages spoken (Albanian, English, etc.)
   - Industry experience and domain knowledge
   - Soft skills and personal attributes
   - Career level (junior, mid-level, senior)
   - Preferred work type (remote, on-site, hybrid) if mentioned

2. JOB MATCHING CRITERIA (Evaluate each job thoroughly):
   - Skill compatibility: Count how many required skills match candidate's skills. Weight critical skills higher.
   - Experience match: Compare candidate's years of experience with job requirements (junior/mid/senior level)
   - Education alignment: Does candidate's education level meet or exceed job requirements?
   - Industry fit: Does candidate have relevant industry experience mentioned in CV?
   - Location compatibility: 
     * If job is remote (IsRemote: true), it's accessible to anyone
     * If job has specific location (Country, City), consider if candidate can relocate or is local
   - Salary expectations: Consider if job salary range (SalaryFrom-SalaryTo) aligns with candidate's level
   - Company and industry: Does the company/industry match candidate's career interests?
   - Job description analysis: Deeply analyze job description for requirements, responsibilities, and expectations
   - Career progression: Is this job a logical next step for candidate's career path?

3. MATCH SCORING (Calculate 0-100):
   - 90-100: Excellent match - candidate exceeds requirements
   - 75-89: Very good match - candidate meets all key requirements
   - 60-74: Good match - candidate meets most requirements with some gaps
   - Below 60: Do NOT recommend (insufficient match)

4. RECOMMENDATION REQUIREMENTS:
   - Only recommend jobs with match score >= 60
   - Provide detailed, specific, and professional reasons for each match (2-4 sentences)
   - Structure the reason to include:
     * Key matching skills and competencies
     * Experience level alignment
     * Education and qualifications match
     * Industry/domain fit
     * Location/remote compatibility
     * Any notable strengths that make candidate stand out
     * Minor gaps (if any) that don't disqualify the candidate
   - Be specific: mention actual skills, technologies, years of experience from CV
   - If CV is in Albanian, write reason in Albanian. If in English, write in English.
   - Make reasons compelling and informative to help candidate understand why this job fits

5. OUTPUT FORMAT:
   Return ONLY a valid JSON array. No markdown, no code blocks, no additional text.
   If no good matches (all scores < 60), return empty array: []

JSON FORMAT (Example for Albanian CV):
[
  {{
    ""jobId"": ""guid-string"",
    ""matchScore"": 88,
    ""reason"": ""Përputhje e shkëlqyer: Kandidati ka 5+ vjet përvojë profesionale në React, Node.js dhe TypeScript, që përputhen plotësisht me kërkesat kryesore të pozicionit. Ka certifikim në Full Stack Development dhe përvojë të provuar në projekte enterprise. Edukimi në Computer Science (Bachelor) dhe përvoja 5-vjeçare në industrinë e teknologjisë e bëjnë kandidatin ideal për këtë rol senior. Pozicioni është remote, që ofron fleksibilitet të plotë.""
  }},
  {{
    ""jobId"": ""guid-string"",
    ""matchScore"": 75,
    ""reason"": ""Përputhje e mirë: Kandidati ka shumicën e aftësive teknike të kërkuara (JavaScript, TypeScript, React, REST APIs). Ka 3 vjet përvojë profesionale ndërsa puna preferon 4+, por portfolio-ja e tij tregon projekte komplekse dhe njohuri të thella. Edukimi në Computer Science dhe certifikimet në web development kompensojnë për përvojën pak më të shkurtër. Pozicioni është në Tiranë, që mund të jetë i përshtatshëm për kandidatët lokalë.""
  }}
]

JSON FORMAT (Example for English CV):
[
  {{
    ""jobId"": ""guid-string"",
    ""matchScore"": 92,
    ""reason"": ""Excellent match: Candidate has 6+ years of professional experience with React, Node.js, and TypeScript, perfectly aligning with the core job requirements. Holds a Full Stack Development certification and proven track record in enterprise-level projects. Bachelor's degree in Computer Science combined with extensive tech industry experience makes this candidate ideal for this senior role. The position is remote, offering full flexibility.""
  }},
  {{
    ""jobId"": ""guid-string"",
    ""matchScore"": 68,
    ""reason"": ""Good match: Candidate possesses most required technical skills (JavaScript, TypeScript, React, REST APIs). Has 3 years of professional experience while the role prefers 4+, but their portfolio demonstrates complex projects and deep technical knowledge. Computer Science education and web development certifications compensate for slightly less experience. The position is in Tirana, which may be suitable for local candidates.""
  }}
]

IMPORTANT:
- Be thorough and specific in your analysis
- Consider both technical and soft skills
- Match the language of the CV in your response
- Only return valid JSON, no explanations outside the JSON structure";
        }

        private List<JobRecommendationDto> ParseRecommendations(JsonDocument responseJson, List<JobDto> jobs)
        {
            var recommendations = new List<JobRecommendationDto>();

            try
            {
                var choices = responseJson.RootElement.GetProperty("choices");
                if (choices.GetArrayLength() == 0)
                    return recommendations;

                var message = choices[0].GetProperty("message");
                var content = message.GetProperty("content").GetString();

                if (string.IsNullOrWhiteSpace(content))
                    return recommendations;

                content = content.Trim();
                if (content.StartsWith("```json"))
                    content = content.Substring(7);
                if (content.StartsWith("```"))
                    content = content.Substring(3);
                if (content.EndsWith("```"))
                    content = content.Substring(0, content.Length - 3);
                content = content.Trim();

                var recommendationsJson = JsonDocument.Parse(content);
                var recommendationsArray = recommendationsJson.RootElement.EnumerateArray();

                foreach (var rec in recommendationsArray)
                {
                    if (rec.TryGetProperty("jobId", out var jobIdElement))
                    {
                        var jobIdStr = jobIdElement.GetString();
                        if (Guid.TryParse(jobIdStr, out var jobId))
                        {
                            var job = jobs.FirstOrDefault(j => j.Id == jobId);
                            if (job != null)
                            {
                                var matchScore = rec.TryGetProperty("matchScore", out var scoreElement) 
                                    ? scoreElement.GetInt32() 
                                    : 0;
                                
                                var reason = rec.TryGetProperty("reason", out var reasonElement) 
                                    ? reasonElement.GetString() ?? "" 
                                    : "";

                                recommendations.Add(new JobRecommendationDto
                                {
                                    Job = job,
                                    MatchScore = matchScore,
                                    Reason = reason
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing AI recommendations");
            }

            return recommendations.OrderByDescending(r => r.MatchScore).ToList();
        }
    }
}

