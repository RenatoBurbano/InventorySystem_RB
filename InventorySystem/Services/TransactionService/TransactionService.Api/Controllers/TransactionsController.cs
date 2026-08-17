using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransactionService.Api.Data;
using TransactionService.Api.Models;
using TransactionService.Api.Services;

namespace TransactionService.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly TransactionDbContext _context;
        private readonly ProductServiceClient _productServiceClient;

        public TransactionsController(
            TransactionDbContext context,
            ProductServiceClient productServiceClient)
        {
            _context = context;
            _productServiceClient = productServiceClient;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<Transaction>>> GetTransactions(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int productId = 0,
            [FromQuery] string transactionType = "")
        {
            var query = _context.Transactions.AsQueryable();

            if (productId != 0)
            {
                query = query.Where(p => p.ProductId == productId);
            }

            if (!string.IsNullOrEmpty(transactionType))
            {
                query = query.Where(p => p.TransactionType.Contains(transactionType));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(p => p.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new PagedResult<Transaction>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transaction>> GetTransaction(Guid id)
        {
            var transaction = await _context.Transactions.FindAsync(id);

            if (transaction == null)
                return NotFound();

            return transaction;
        }

        [HttpPost("purchase")]
        public async Task<ActionResult<Transaction>> CreatePurchase(TransactionDto transactionDto)
        {
            return await CreateTransaction(transactionDto, "Purchase");
        }

        [HttpPost("sale")]
        public async Task<ActionResult<Transaction>> CreateSale(TransactionDto transactionDto)
        {
            return await CreateTransaction(transactionDto, "Sale");
        }

        private async Task<ActionResult<Transaction>> CreateTransaction(TransactionDto transactionDto, string type)
        {
            using var dbTransaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var product = await _productServiceClient.GetProductAsync(transactionDto.ProductId);

                if (product == null)
                    return NotFound($"Product with ID {transactionDto.ProductId} not found");

                if (type == "Sale" && product.Stock < transactionDto.Amount)
                    return BadRequest("Insufficient stock");

                var newStock = type == "Purchase"
                    ? product.Stock + transactionDto.Amount
                    : product.Stock - transactionDto.Amount;

                var transaction = new Transaction
                {
                    ProductId = transactionDto.ProductId,
                    TransactionType = type,
                    Amount = transactionDto.Amount,
                    UnitPrice = transactionDto.UnitPrice,
                    TotalPrice = transactionDto.Amount * transactionDto.UnitPrice,
                    CreatedDate = DateTime.UtcNow,
                    Detail = transactionDto.Detail
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                var stockUpdated = await _productServiceClient.UpdateProductStockAsync(
                    transactionDto.ProductId, newStock);

                if (!stockUpdated)
                    throw new Exception("Failed to update product stock");

                await dbTransaction.CommitAsync();

                return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                return StatusCode(500, "Error processing transaction");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var product = await _context.Transactions.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Transactions.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
