using Elektrikulu.Data;
using Elektrikulu.Models;
using Microsoft.AspNetCore.Mvc;

namespace Elektrikulu.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class DeviceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DeviceController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public List<Device> GetDevices()
        {
            var devices = _context.Devices.ToList();
            return devices;
        }

        [HttpPost]
        public List<Device> PostDevice([FromBody] Device device)
        {
            _context.Devices.Add(device);
            _context.SaveChanges();
            return _context.Devices.ToList();
        }

        [HttpDelete("{id}")]
        public List<Device> DeleteDevice(int id)
        {
            var device = _context.Devices.Find(id);

            if (device == null)
            {
                return _context.Devices.ToList();
            }

            _context.Devices.Remove(device);
            _context.SaveChanges();
            return _context.Devices.ToList();
        }

        [HttpGet("{id}")]
        public ActionResult<Device> GetDevice(int id)
        {
            var device = _context.Devices.Find(id);

            if (device == null)
            {
                return NotFound();
            }

            return device;
        }

        [HttpPut("{id}")]
        public ActionResult<List<Device>> EditDevice(int id, [FromBody] Device updatedDevice)
        {
            var device = _context.Devices.Find(id);

            if (device == null)
            {
                return NotFound();
            }

            device.Name = updatedDevice.Name;
            device.Watts = updatedDevice.Watts;

            _context.Devices.Update(device);
            _context.SaveChanges();

            return Ok(_context.Devices);
        }

        [HttpPost("/save-many-devices")]
        public ActionResult<List<Device>> SaveManyDevices([FromBody] List<Device> devices)
        {
            _context.Devices.AddRange(devices);
            _context.SaveChanges();

            return devices;
        }
    }
}