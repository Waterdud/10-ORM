using Elektrikulu.Data;
using Elektrikulu.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace Elektrikulu.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UsageController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ApplicationDbContext _context;

        public UsageController(HttpClient httpClient, ApplicationDbContext context)
        {
            _httpClient = httpClient;
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Task<Usage>>> PostUsageAsync([FromBody] Usage usage)
        {
            var startOfUse = usage.Start;
            var endOfUse = usage.End;
            var start = startOfUse.ToUniversalTime().ToString("yyyy-MM-ddTHH:00:00.000Z");
            var end = endOfUse.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

            var response = await _httpClient.GetAsync($"https://dashboard.elering.ee/api/nps/price?start={start}&end={end}");
            var responseBody = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(responseBody);
            var root = jsonDoc.RootElement;

            if (!root.TryGetProperty("data", out var dataProperty))
            {
                return BadRequest("Vastuses puudub 'data' väli.");
            }

            if (!dataProperty.TryGetProperty("ee", out var eeProperty))
            {
                return BadRequest("Vastuses puudub 'ee' väli.");
            }

            var prices = eeProperty.EnumerateArray().ToList();

            double sum = 0;

            if (prices.Count == 1) // kui on tegemist sama tunniga, erinevad vaid minutid
            {
                double cost = prices.First().GetProperty("price").GetDouble() * (endOfUse.Minute - startOfUse.Minute) / 60;
                sum += cost;
            }
            

            if (prices.Count > 1) // kui on tegemist kahe või rohkema erineva tunniga
            {
                // arvutame kokku esimese ja viimase tunni maksumused vastavalt tunnis tarbitud minutitele
                double costFirstHour = prices.First().GetProperty("price").GetDouble() * (60 - startOfUse.Minute) / 60;
                sum += costFirstHour;
                double costLastHour = prices.Last().GetProperty("price").GetDouble() * (endOfUse.Minute) / 60;
                sum += costLastHour;
            }
            
            if (prices.Count > 2)
            {
                prices.RemoveAt(0); // võtame esimese hinna ära, kuna see on juba liidetud kogusummale
                prices.RemoveAt(prices.Count - 1); // võtame viimase hinna ära, kuna see on juba liidetud kogusummale
                sum += prices.Sum(x => x.GetProperty("price").GetDouble()); // saame kõik hinnad kokku liita, sest tegemist on alati täistunniga ühe kasutuskorra puhul
            }

            var device = _context.Devices.Find(usage.DeviceId);

            if (device == null)
            {
                return Ok (_context.Usages.ToList());
            }

            double totalUsageCost = sum / 1000000 * device.Watts;
            // jagame megawati miljoniga, et saada watid ning seejärel korrutame tarbitud wattidega
            usage.TotalUsageCost = totalUsageCost;
            
            _context.Usages.Add(usage);
            _context.SaveChanges();
            return Ok (_context.Usages.ToList());
        }

        [HttpGet]
        public List<Usage> GetUsages()
        {
            var usages = _context.Usages.ToList();
            return usages;
        }

        [HttpDelete("{id}")]
        public List<Usage> DeleteUsage(int id)
        {
            var usage = _context.Usages.Find(id);

            if (usage == null)
            {
                return _context.Usages.ToList();
            }

            _context.Usages.Remove(usage);
            _context.SaveChanges();
            return _context.Usages.ToList();
        }

        [HttpGet("{id}")]
        public ActionResult<Usage> GetUsage(int id)
        {
            var usage = _context.Usages.Find(id);

            if (usage == null)
            {
                return NotFound();
            }

            return usage;
        }

        [HttpGet("usage-start-period")]
        public ActionResult<List<Usage>> GetUsagesByStart([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var usages = _context.Usages
                .Where(u => u.Start >= startDate && u.Start <= endDate)
                .ToList();

            return usages;
        }

        [HttpGet("usage-end-period")]
        public ActionResult<List<Usage>> GetUsagesByEnd([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var usages = _context.Usages
                .Where(u => u.End >= startDate && u.End <= endDate)
                .ToList();

            return usages;
        }

        [HttpGet("usage-customer")]
        public ActionResult<List<Usage>> GetUsagesByCustomer([FromQuery] int customerId)
        {
            var usages = _context.Usages
                .Where(u => u.CustomerId == customerId)
                .ToList();

            return usages;
        }

        [HttpGet("usage-customer-sum")]
        public ActionResult<double> GetUsageSumByCustomer([FromQuery] int customerId)
        {
            var usages = _context.Usages
                .Where(u => u.CustomerId == customerId)
                .ToList();

            double totalSum = usages.Sum(u => u.TotalUsageCost);


            return totalSum;
        }

        [HttpGet("usage-customer-sum-period")]
        public ActionResult<double> GetUsagesSumByCustomerAndEnd(
            [FromQuery] int customerId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate
        )
        {
            var usages = _context.Usages
                .Where(u => u.CustomerId == customerId && u.End >= startDate && u.End <= endDate)
                .ToList();

            double totalSum = usages.Sum(u => u.TotalUsageCost);

            return totalSum;
        }

    }
}