using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Soda.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Models;

namespace SodaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 顯示所有商品
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.Products.ToListAsync();
            return Ok(products);
        }

        // 更新商品（名稱、價格、庫存、圖片、規格）
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            if (updatedProduct == null)
                return BadRequest(new { message = "無效的商品資料" });

            if (string.IsNullOrWhiteSpace(updatedProduct.Name))
                return BadRequest(new { message = "商品名稱不能為空" });

            if (updatedProduct.Price < 0)
                return BadRequest(new { message = "價格不能小於0" });

            if (updatedProduct.Stock < 0)
                return BadRequest(new { message = "庫存不能小於0" });

            if (string.IsNullOrWhiteSpace(updatedProduct.ImageUrl))
                return BadRequest(new { message = "無效的連結" });

            if (string.IsNullOrWhiteSpace(updatedProduct.Size))
                return BadRequest(new { message = "無效的規格" });

            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
                return NotFound(new { message = "找不到該商品" });

            // 更新欄位
            existingProduct.Name = updatedProduct.Name;
            existingProduct.Price = updatedProduct.Price;
            existingProduct.Stock = updatedProduct.Stock;
            existingProduct.ImageUrl = updatedProduct.ImageUrl;
            existingProduct.Size = updatedProduct.Size;

            await _context.SaveChangesAsync();

            return Ok(new { message = "商品更新成功" });
        }
    }
}
