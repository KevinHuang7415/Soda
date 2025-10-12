using Microsoft.AspNetCore.Mvc;
using soda.Models;

namespace soda.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController
    {
        //虛擬資料
        private static List<Product> products = new List<Product>
        {
            new Product { Id = 1, Name = "Lemo", Description = "4入裝", Price = 199, ImgeUrl = "", Stock = 100 },
            new Product { Id = 2, Name = "Lemo", Description = "12入裝", Price = 499, ImgeUrl = "", Stock = 100 },
            new Product { Id = 3, Name = "Grap", Description = "4入裝", Price = 199, ImgeUrl = "", Stock = 100 },
            new Product { Id = 4, Name = "Grap", Description = "12入裝", Price = 499, ImgeUrl = "", Stock = 100 },
            new Product { Id = 5, Name = "Strawberry", Description = "4入裝", Price = 199, ImgeUrl = "", Stock = 100 },
            new Product { Id = 6, Name = "Strawberry", Description = "12入裝", Price = 499, ImgeUrl = "", Stock = 100 }        
        };
        
        //Get api/products
        [HttpGet]
        public ActionResult<List<Product>> GetProducts()
        {
            return products;
        }

        //Get api/products/{id}
        [HttpGet("{id}")]
        public ActionResult<Product> GetById(int id)
        {
            var product = products.FirstOrDefault(p => p.Id == id);
            if (product == null) return NotFound();
            return Ok(product);
        }


        // POST api/products
        [HttpPost]
        public ActionResult<Product> Create(Product product)
        {
            product.Id = products.Max(p => p.Id) + 1;
            products.Add(product);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        // PUT api/products/1
        [HttpPut("{id}")]
        public IActionResult Update(int id, Product updatedProduct)
        {
            var product = products.FirstOrDefault(p => p.Id == id);
            if (product == null) return NotFound();

            product.Name = updatedProduct.Name;
            product.Price = updatedProduct.Price;
            product.Stock = updatedProduct.Stock;
            product.ImgUrl = updatedProduct.ImgUrl;

            return NoContent();
        }

        // DELETE api/products/1
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var product = products.FirstOrDefault(p => p.Id == id);
            if (product == null) return NotFound();

            products.Remove(product);
            return NoContent();
        }

    }
}
