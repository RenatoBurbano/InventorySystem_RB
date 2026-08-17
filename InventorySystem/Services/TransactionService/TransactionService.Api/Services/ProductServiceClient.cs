using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using TransactionService.Api.Models;

namespace TransactionService.Api.Services
{
    public class ProductServiceClient
    {
        private readonly HttpClient _httpClient;

        public ProductServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<Product?> GetProductAsync(int productId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"/api/products/{productId}");

                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }

                var product = await response.Content.ReadFromJsonAsync<Product>();
                return product;
            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"Cannot connect to ProductService: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<bool> UpdateProductStockAsync(int productId, int newStock)
        {
            try
            {
                var product = await GetProductAsync(productId);
                if (product == null)
                    return false;

                var updateDto = new ProductDto
                {
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    Stock = newStock
                };

                // Actualizar el producto
                var response = await _httpClient.PutAsJsonAsync($"/api/products/{productId}", updateDto);

                if (response.IsSuccessStatusCode)
                {
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to update product stock: {ex.Message}", ex);
            }
        }
    }
}
