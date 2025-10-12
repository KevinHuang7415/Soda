using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using soda.Models;
using System.ComponentModel.DataAnnotations;

namespace soda.Controllers
{
    public class CheckoutViewModel
    {
        // 顧客資料
        [Required] public string CustomerName { get; set; } = "";
        [Required, EmailAddress] public string Email { get; set; } = "";
        [Required] public string Phone { get; set; } = "";
        [Required] public string ShippingAddress { get; set; } = "";
        public Cart Cart { get; set; } = new();
    }

    public class CheckoutController : Controller
    {
        private readonly ICartService _cart;
        private readonly IOrderService _orders;

        public CheckoutController(ICartService cart, IOrderService orders)
        {
            _cart = cart; _orders = orders;
        }

        [HttpGet]
        public IActionResult Index()
        {
            var vm = new CheckoutViewModel { Cart = _cart.GetCart() };
            if (!vm.Cart.Items.Any()) return RedirectToAction("Index", "Cart");
            return View(vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Place(CheckoutViewModel vm)
        {
            vm.Cart = _cart.GetCart();
            if (!vm.Cart.Items.Any())
            {
                ModelState.AddModelError("", "購物車為空。");
            }

            if (!ModelState.IsValid)
            {
                return View("Index", vm);
            }

            // 建立訂單
            var order = new Order
            {
                CustomerName = vm.CustomerName,
                Email = vm.Email,
                Phone = vm.Phone,
                ShippingAddress = vm.ShippingAddress,
                Items = vm.Cart.Items.Select(i => new OrderItem
                {
                    ProductId = i.ProductId,
                    Name = i.Name,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity
                }).ToList()
            };

            _orders.CreateOrder(order);
            _cart.Clear();

            return RedirectToAction("Success", new { id = order.OrderId });
        }

        public IActionResult Success(Guid id)
        {
            var order = _orders.GetOrder(id);
            if (order == null) return NotFound();
            return View(order);
        }
    }

}
