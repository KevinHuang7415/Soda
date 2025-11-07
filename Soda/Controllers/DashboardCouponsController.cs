using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Soda.Data;
using Soda.Migrations;
using Soda.Models.DTOs;
using System.Diagnostics;
using System.Security.AccessControl;
using WebApplication1.Models;


namespace SodaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public CouponsController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var coupons = await _context.Coupons.ToListAsync();
            return Ok(coupons);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCoupon(int id, [FromBody] Coupon updatedCoupon)
        {
            if (updatedCoupon == null)
                return BadRequest(new { message = "請提供有效的優惠券資料" });
            if (updatedCoupon.Discount >= 100 && updatedCoupon.DiscountType == "P")
                return BadRequest(new { message = "折扣百分比錯誤" });
            if (!ModelState.IsValid)
                return BadRequest(new { message = "折扣必須為數字" });
            var existingCoupon = await _context.Coupons.FindAsync(id);
            if (existingCoupon == null)
                return NotFound(new { message = "找不到優惠券" });

            // 更新欄位
            existingCoupon.Code = updatedCoupon.Code;
            existingCoupon.Discount = updatedCoupon.Discount;
            existingCoupon.Status = updatedCoupon.Status;
            existingCoupon.DiscountType = updatedCoupon.DiscountType;

            await _context.SaveChangesAsync();

            return Ok(new { message = "優惠券更新成功" });
        }
        
        [HttpPost]
        public async Task<IActionResult>Create([FromBody] Coupon newCoupon)
        {
            if (newCoupon == null)
                return BadRequest(new { message = "無效的優惠券資料" });
            if(newCoupon.Discount < 0)
                return BadRequest(new { message = "折扣不能小於0" });
            if (newCoupon.Discount >=100 && newCoupon.DiscountType == "P")
                return BadRequest(new { message = "折扣百分比錯誤" });
            _context.Coupons.Add(newCoupon);
            await _context.SaveChangesAsync();
            return Ok(new { message = "優惠券新增成功", data = newCoupon });
        }
        
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCoupon(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
                return NotFound(new { message = "找不到該優惠券" });
            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();
            return Ok(new { message = "優惠券已刪除" });
        }
        

    }

}
