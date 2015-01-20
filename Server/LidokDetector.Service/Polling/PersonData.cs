using System;

namespace LidokDetector.Service.Polling
{
    internal class PersonData
    {
        public string Office { get; set; }
        public DateTime LastRequest { get; set; }
        public string JsonData { get; set; }
    }
}