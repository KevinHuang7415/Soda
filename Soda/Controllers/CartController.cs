using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace soda.Controllers
{
    public class CartController : Controller
    {
        private readonly ICartService _cart;

        public CartController(ICartService cart) => _cart = cart;

        public IActionResult Index() => View(_cart.GetCart());

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Update(int id, int qty)
        {
            _cart.Update(id, qty);
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Remove(int id)
        {
            _cart.Remove(id);
            return RedirectToAction(nameof(Index));
        }
    }

}
