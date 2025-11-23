using System.Text;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;

namespace PunaBoost.Services
{
    public interface IResumeTextExtractionService
    {
        Task<string> ExtractTextFromResumeAsync(string filePath);
    }

    public class ResumeTextExtractionService : IResumeTextExtractionService
    {
        private readonly ILogger<ResumeTextExtractionService> _logger;

        public ResumeTextExtractionService(ILogger<ResumeTextExtractionService> logger)
        {
            _logger = logger;
        }

        public async Task<string> ExtractTextFromResumeAsync(string filePath)
        {
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException("Resume file not found", filePath);
            }

            var extension = Path.GetExtension(filePath).ToLower();
            
            return extension switch
            {
                ".pdf" => await ExtractTextFromPdfAsync(filePath),
                ".txt" => await File.ReadAllTextAsync(filePath),
                ".docx" => await ExtractTextFromDocxAsync(filePath),
                _ => throw new NotSupportedException($"File type {extension} is not supported. Please use PDF or TXT format.")
            };
        }

        private async Task<string> ExtractTextFromPdfAsync(string filePath)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var text = new StringBuilder();
                    
                    using (var pdfReader = new PdfReader(filePath))
                    using (var pdfDocument = new PdfDocument(pdfReader))
                    {
                        var strategy = new SimpleTextExtractionStrategy();
                        
                        for (int i = 1; i <= pdfDocument.GetNumberOfPages(); i++)
                        {
                            var page = pdfDocument.GetPage(i);
                            var pageText = PdfTextExtractor.GetTextFromPage(page, strategy);
                            text.AppendLine(pageText);
                        }
                    }
                    
                    return text.ToString();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error extracting text from PDF");
                    throw new Exception("Could not extract text from PDF. Please ensure the file is a valid PDF.", ex);
                }
            });
        }

        private async Task<string> ExtractTextFromDocxAsync(string filePath)
        {
            try
            {
                using var stream = File.OpenRead(filePath);
                using var wordDocument = DocumentFormat.OpenXml.Packaging.WordprocessingDocument.Open(stream, false);
                var body = wordDocument.MainDocumentPart?.Document?.Body;
                
                if (body == null)
                    return string.Empty;

                var text = new StringBuilder();
                foreach (var paragraph in body.Elements<DocumentFormat.OpenXml.Wordprocessing.Paragraph>())
                {
                    foreach (var run in paragraph.Elements<DocumentFormat.OpenXml.Wordprocessing.Run>())
                    {
                        foreach (var textElement in run.Elements<DocumentFormat.OpenXml.Wordprocessing.Text>())
                        {
                            text.Append(textElement.Text);
                        }
                    }
                    text.AppendLine();
                }
                
                return await Task.FromResult(text.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting text from DOCX");
                throw new Exception("Could not extract text from DOCX file.", ex);
            }
        }
    }
}

