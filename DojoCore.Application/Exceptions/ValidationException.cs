namespace DojoCore.Application.Exceptions;

public class ValidationException : Exception
{
    public Dictionary<string, string[]> Details { get; }

    public ValidationException(Dictionary<string, string[]> details)
        : base("Invalid registration data.")
    {
        Details = details;
    }
}
