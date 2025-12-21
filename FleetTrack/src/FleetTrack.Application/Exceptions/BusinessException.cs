namespace FleetTrack.Application.Exceptions;

/// <summary>
/// Exception levée lors d'une violation de règle métier
/// </summary>
public class BusinessException : Exception
{
    public BusinessException(string message)
        : base(message)
    {
    }

    public BusinessException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
