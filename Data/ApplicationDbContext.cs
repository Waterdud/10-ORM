using Elektrikulu.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Elektrikulu.Data
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<Usage> Usages { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
    }
}