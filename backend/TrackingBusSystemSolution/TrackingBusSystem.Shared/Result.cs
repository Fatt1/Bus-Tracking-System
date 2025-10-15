namespace TrackingBusSystem.Shared
{
    public class Result
    {
        public bool IsSuccess { get; set; }
        public bool IsFailure => !IsSuccess;
        public Error Error { get; set; }
        protected Result(bool isSuccess, Error error)
        {
            if (isSuccess && error != Error.None ||
                !isSuccess && error == Error.None)
            {
                throw new InvalidOperationException("Invalid result");
            }
            IsSuccess = isSuccess;
            Error = error;
        }
        public static Result Success() => new Result(true, Error.None);
        public static Result Failure(Error error) => new Result(false, error);
    }

    public class Result<TValue> : Result
    {
        private readonly TValue _value;
        protected Result(bool isSuccess, Error error, TValue value)
            : base(isSuccess, error)
        {
            _value = value;
        }
        public TValue Value => IsSuccess
            ? _value
            : throw new InvalidOperationException("No value for failure.");
        public static Result<TValue> Success(TValue value) => new Result<TValue>(true, Error.None, value);
        public static new Result<TValue> Failure(Error error) => new Result<TValue>(false, error, default!);

    }
}
