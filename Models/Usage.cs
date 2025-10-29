namespace Elektrikulu.Models
{
    public class Usage
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int DeviceId { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public double TotalUsageCost { get; set; }
    }
}
