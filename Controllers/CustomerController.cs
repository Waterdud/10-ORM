using Elektrikulu.Data;
using Elektrikulu.Models;
using Microsoft.AspNetCore.Mvc;

namespace Elektrikulu.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public List<Customer> GetCustomers()
        {
            var customers = _context.Customers.ToList();
            return customers;
        }

        [HttpPost]
        public List<Customer> PostCustomer([FromBody] Customer customer)
        {
            _context.Customers.Add(customer);
            _context.SaveChanges();
            return _context.Customers.ToList();
        }

        [HttpDelete("{id}")]
        public List<Customer> DeleteCustomer(int id)
        {
            var customer = _context.Customers.Find(id);

            if (customer == null)
            {
                return _context.Customers.ToList();
            }

            _context.Customers.Remove(customer);
            _context.SaveChanges();
            return _context.Customers.ToList();
        }

        [HttpGet("{id}")]
        public ActionResult<Customer> GetCustomer(int id)
        {
            var customer = _context.Customers.Find(id);

            if (customer == null)
            {
                return NotFound();
            }

            return customer;
        }

        [HttpPut("{id}")]
        public ActionResult<List<Customer>> EditCustomer(int id, [FromBody] Customer updatedCustomer)
        {
            var customer = _context.Customers.Find(id);

            if (customer == null)
            {
                return NotFound();
            }

            customer.FirstName = updatedCustomer.FirstName;
            customer.LastName = updatedCustomer.LastName;

            _context.Customers.Update(customer);
            _context.SaveChanges();

            return Ok(_context.Customers);
        }
    }
}