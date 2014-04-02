using System;
using System.Linq;
using System.ServiceModel;
using NLog;

namespace MdService
{
    class Program
    {
        private static Logger log = LogManager.GetCurrentClassLogger();
        static void Main(string[] args)
        {
            log.Info("================================================================");
            log.Info("================ Manager detector service v 1.0 ================");
            log.Info("================================================================");   
            log.Info("Start service hosting ");
            var host = new ServiceHost(typeof(ManagerDetectorService));
            host.Open();
            host.Description.Endpoints.ToList().ForEach(e=> log.Trace(e.Address));
            
            log.Info("Press Enter for exit");
            Console.Read();
        }
    }
}
