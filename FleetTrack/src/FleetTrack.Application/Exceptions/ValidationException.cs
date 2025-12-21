namespace FleetTrack.Application.Exceptions;

/// <summary>
/// Exception levée lors d'une erreur de validation
/// </summary>
public class ValidationException : Exception
{
    public List<string> Errors { get; }

    public ValidationException(List<string> errors)
        : base("One or more validation errors occurred.")
    {
        Errors = errors;
    }

    public ValidationException(string error)
        : base(error)
    {
        Errors = new List<string> { error };
    }
}
