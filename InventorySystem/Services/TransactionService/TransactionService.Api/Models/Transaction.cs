namespace TransactionService.Api.Models
{
    public class Transaction
    {
        public Guid Id { get; set; }
        public DateTime CreatedDate { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public int ProductId { get; set; }
        public int Amount { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Detail { get; set; }
    }

    public class TransactionDto
    {
        public DateTime CreatedDate { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public int ProductId { get; set; }
        public int Amount { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string Detail { get; set; } = string.Empty;
    }

    public class PagedResult<T>
    {
        public List<T>? Items { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPrevious => PageNumber > 1;
        public bool HasNext => PageNumber < TotalPages;
    }
}
